import mongoose from "mongoose";
import Inventory from "../models/inventory.js";
import Product from "../models/product.js";
import { findFranchisesServingLocation } from "./assignment.js";

/** Franchise lists categories it serves; empty means all (legacy). */
export function franchiseServesCategory(franchise, categoryId) {
  if (!categoryId) return false;
  const sc = franchise.servedCategories || [];
  if (!sc.length) return true;
  return sc.some((c) => c.toString() === categoryId.toString());
}

/**
 * Nearest franchise wins per product: first covering node (distance-sorted) with stock
 * that serves the product category. Values are plain numbers / ObjectIds.
 * @returns {Map<string, { franchiseId: import('mongoose').Types.ObjectId, listPrice: number, effectivePrice: number }>}
 */
export async function getStorefrontOffersByProduct(lat, lng) {
  const franchises = await findFranchisesServingLocation(lat, lng);
  if (!franchises.length) return new Map();

  const franchiseIds = franchises.map((f) => f._id);
  const inventories = await Inventory.find({
    franchiseId: { $in: franchiseIds },
  }).lean();

  const invByFranchise = new Map();
  for (const inv of inventories) {
    invByFranchise.set(inv.franchiseId.toString(), inv);
  }

  const productIdStrs = new Set();
  for (const inv of inventories) {
    for (const row of inv.items || []) {
      if (row.currentStock > 0 && row.productId) {
        productIdStrs.add(row.productId.toString());
      }
    }
  }

  const oids = [...productIdStrs]
    .map((id) => {
      try {
        return new mongoose.Types.ObjectId(id);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const productDocs = await Product.find({
    _id: { $in: oids },
    status: "active",
  })
    .select("_id category price")
    .lean();

  const productMap = new Map(productDocs.map((p) => [p._id.toString(), p]));

  const offerMap = new Map();
  for (const f of franchises) {
    const inv = invByFranchise.get(f._id.toString());
    if (!inv) continue;
    for (const row of inv.items || []) {
      if (!row.productId || row.currentStock <= 0) continue;
      const pid = row.productId.toString();
      if (offerMap.has(pid)) continue;
      const prod = productMap.get(pid);
      if (!prod) continue;
      const catId = prod.category?.toString();
      if (!catId || !franchiseServesCategory(f, catId)) continue;
      const listPrice = Number(prod.price) || 0;
      const eff =
        row.franchisePrice != null && row.franchisePrice !== ""
          ? Number(row.franchisePrice)
          : listPrice;
      offerMap.set(pid, {
        franchiseId: f._id,
        listPrice,
        effectivePrice: eff,
      });
    }
  }
  return offerMap;
}

export async function getStorefrontProductIdsForLocation(lat, lng) {
  const m = await getStorefrontOffersByProduct(lat, lng);
  return [...m.keys()];
}

export async function getStorefrontCategoryIdsForLocation(lat, lng) {
  const ids = await getStorefrontProductIdsForLocation(lat, lng);
  if (!ids.length) return [];
  const oids = ids
    .map((id) => {
      try {
        return new mongoose.Types.ObjectId(id);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  const cats = await Product.distinct("category", {
    _id: { $in: oids },
    status: "active",
  });
  return cats.filter(Boolean);
}
