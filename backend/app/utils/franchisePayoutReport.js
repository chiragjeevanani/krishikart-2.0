import Order from "../models/order.js";
import Franchise from "../models/franchise.js";
import Product from "../models/product.js";
import FranchiseCommission from "../models/franchiseCommission.js";
import Category from "../models/category.js";

function uniqueCategoryIds(ids) {
  const seen = new Set();
  const out = [];
  for (const id of ids) {
    const s = String(id);
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

/**
 * @param {{ franchiseId?: import("mongoose").Types.ObjectId | string | null, from?: string, to?: string }} opts
 * `franchiseId` null/undefined = all franchises (admin). Set for single-franchise report.
 */
export function buildPayoutOrderMatch({ franchiseId, from, to }) {
  const match = {
    orderStatus: { $in: ["Delivered", "Received"] },
  };
  if (franchiseId != null && franchiseId !== "") {
    match.franchiseId = franchiseId;
  } else {
    match.franchiseId = { $ne: null };
  }

  if (from || to) {
    match.createdAt = {};
    if (from) {
      const fromDate = new Date(from);
      if (!Number.isNaN(fromDate.getTime())) {
        match.createdAt.$gte = fromDate;
      }
    }
    if (to) {
      const toDate = new Date(to);
      if (!Number.isNaN(toDate.getTime())) {
        toDate.setHours(23, 59, 59, 999);
        match.createdAt.$lte = toDate;
      }
    }
    if (!match.createdAt.$gte && !match.createdAt.$lte) {
      delete match.createdAt;
    }
  }

  return match;
}

export async function fetchPayoutOrders({ franchiseId, from, to }) {
  const match = buildPayoutOrderMatch({ franchiseId, from, to });
  return Order.find(match)
    .select("franchiseId items subtotal totalAmount createdAt orderStatus")
    .lean();
}

/**
 * @param {Array<Record<string, unknown>>} orders
 * @returns {Promise<{ summary: object, franchiseRows: object[] }>}
 */
export async function aggregatePayoutsFromOrders(orders) {
  if (!orders.length) {
    return {
      summary: {
        totalFranchises: 0,
        totalOrders: 0,
        totalOrderValue: 0,
        totalPayable: 0,
      },
      franchiseRows: [],
    };
  }

  const franchiseIdSet = new Set();
  const productIdSet = new Set();

  for (const order of orders) {
    if (order.franchiseId) franchiseIdSet.add(String(order.franchiseId));
    for (const item of order.items || []) {
      if (item.productId) productIdSet.add(String(item.productId));
    }
  }

  const [franchises, products, commissions] = await Promise.all([
    Franchise.find({ _id: { $in: Array.from(franchiseIdSet) } })
      .select("franchiseName ownerName city mobile servedCategories")
      .lean(),
    Product.find({ _id: { $in: Array.from(productIdSet) } })
      .select("category")
      .lean(),
    FranchiseCommission.find({
      franchiseId: { $in: Array.from(franchiseIdSet) },
    })
      .select("franchiseId categoryId commissionPercentage")
      .lean(),
  ]);

  const franchiseMap = new Map(franchises.map((f) => [String(f._id), f]));
  const productCategoryMap = new Map(
    products.map((p) => [String(p._id), String(p.category)]),
  );
  const commissionMap = new Map(
    commissions.map((c) => [
      `${String(c.franchiseId)}:${String(c.categoryId)}`,
      Number(c.commissionPercentage || 0),
    ]),
  );

  const payoutMap = new Map();

  for (const order of orders) {
    const franchiseId = String(order.franchiseId);
    const franchise = franchiseMap.get(franchiseId);
    if (!franchise) continue;

    const servedList = uniqueCategoryIds(franchise.servedCategories || []);
    const restrictToServed = servedList.length > 0;

    if (!payoutMap.has(franchiseId)) {
      payoutMap.set(franchiseId, {
        franchiseId,
        franchiseName:
          franchise.franchiseName ||
          franchise.ownerName ||
          "Unnamed Franchise",
        ownerName: franchise.ownerName || "N/A",
        city: franchise.city || "N/A",
        mobile: franchise.mobile || "N/A",
        orderCount: 0,
        orderValue: 0,
        payableAmount: 0,
        categories: {},
      });
    }

    const entry = payoutMap.get(franchiseId);

    let orderAttributedValue = 0;
    let orderHasAttributedLine = false;

    for (const item of order.items || []) {
      const itemSubtotal = Number(
        item.subtotal || Number(item.price || 0) * Number(item.quantity || 0),
      );
      if (!itemSubtotal) continue;

      const categoryId = productCategoryMap.get(String(item.productId));
      if (!categoryId) continue;

      if (restrictToServed && !servedList.includes(categoryId)) continue;

      orderAttributedValue += itemSubtotal;
      orderHasAttributedLine = true;

      const commissionPercentage =
        commissionMap.get(`${franchiseId}:${categoryId}`) || 0;
      const payout = (itemSubtotal * commissionPercentage) / 100;

      entry.payableAmount += payout;

      if (!entry.categories[categoryId]) {
        entry.categories[categoryId] = {
          categoryId,
          orderValue: 0,
          commissionPercentage,
          payoutAmount: 0,
        };
      }

      entry.categories[categoryId].orderValue += itemSubtotal;
      entry.categories[categoryId].payoutAmount += payout;
    }

    if (restrictToServed) {
      if (orderHasAttributedLine) {
        entry.orderCount += 1;
        entry.orderValue += orderAttributedValue;
      }
    } else {
      entry.orderCount += 1;
      entry.orderValue += Number(order.subtotal || order.totalAmount || 0);
    }
  }

  const categoryIdsFromBuckets = Array.from(
    new Set(
      Array.from(payoutMap.values()).flatMap((f) => Object.keys(f.categories)),
    ),
  );
  const categoryIdsFromServed = franchises.flatMap((f) =>
    (f.servedCategories || []).map((id) => String(id)),
  );
  const categoryIds = Array.from(
    new Set([...categoryIdsFromBuckets, ...categoryIdsFromServed]),
  );

  const categories = await Category.find({ _id: { $in: categoryIds } })
    .select("name")
    .lean();
  const categoryNameMap = new Map(
    categories.map((c) => [String(c._id), c.name]),
  );

  const franchiseRows = Array.from(payoutMap.values())
    .map((row) => {
      const franchise = franchiseMap.get(String(row.franchiseId));
      const servedList = uniqueCategoryIds(franchise?.servedCategories || []);

      let categoryRows;
      if (servedList.length > 0) {
        categoryRows = servedList.map((categoryId) => {
          const bucket = row.categories[categoryId];
          const commissionPercentage =
            commissionMap.get(`${String(row.franchiseId)}:${categoryId}`) || 0;
          return {
            categoryId,
            orderValue: bucket
              ? Number(bucket.orderValue.toFixed(2))
              : 0,
            commissionPercentage,
            payoutAmount: bucket
              ? Number(bucket.payoutAmount.toFixed(2))
              : 0,
            categoryName: categoryNameMap.get(categoryId) || "Uncategorized",
          };
        });
      } else {
        categoryRows = Object.values(row.categories).map((c) => ({
          ...c,
          categoryName: categoryNameMap.get(c.categoryId) || "Uncategorized",
          orderValue: Number(c.orderValue.toFixed(2)),
          payoutAmount: Number(c.payoutAmount.toFixed(2)),
        }));
      }

      return {
        ...row,
        orderValue: Number(row.orderValue.toFixed(2)),
        payableAmount: Number(row.payableAmount.toFixed(2)),
        categories: categoryRows,
      };
    })
    .sort((a, b) => b.payableAmount - a.payableAmount);

  const summary = franchiseRows.reduce(
    (acc, row) => {
      acc.totalFranchises += 1;
      acc.totalOrders += row.orderCount;
      acc.totalOrderValue += row.orderValue;
      acc.totalPayable += row.payableAmount;
      return acc;
    },
    {
      totalFranchises: 0,
      totalOrders: 0,
      totalOrderValue: 0,
      totalPayable: 0,
    },
  );

  summary.totalOrderValue = Number(summary.totalOrderValue.toFixed(2));
  summary.totalPayable = Number(summary.totalPayable.toFixed(2));

  return { summary, franchiseRows };
}
