import VendorInventory from "../models/vendorInventory.js";
import Vendor from "../models/vendor.js";

const normalizeId = (id) => (id && id.toString ? id.toString() : String(id));

export async function isProductAssignedToVendor(vendorId, productId) {
    const vendor = await Vendor.findById(vendorId).select("products").lean();
    if (!vendor) return false;
    const pid = normalizeId(productId);
    return (vendor.products || []).some((p) => normalizeId(p) === pid);
}

/**
 * Keeps VendorInventory.items in lockstep with Vendor.products (admin assignments).
 * Preserves stock / availability for rows that still exist after assignment changes.
 */
export async function syncInventoryToAssignedProducts(vendorId) {
    const vendor = await Vendor.findById(vendorId).select("products").lean();
    if (!vendor) return null;

    const orderedProductRefs = [];
    const seen = new Set();
    for (const p of vendor.products || []) {
        const id = normalizeId(p);
        if (!seen.has(id)) {
            seen.add(id);
            orderedProductRefs.push(p);
        }
    }

    let inventory = await VendorInventory.findOne({ vendorId });
    if (!inventory) {
        inventory = new VendorInventory({ vendorId, items: [] });
    }

    const existingByProduct = new Map();
    for (const item of inventory.items) {
        existingByProduct.set(normalizeId(item.productId), item);
    }

    const newItems = orderedProductRefs.map((productRef) => {
        const key = normalizeId(productRef);
        const prev = existingByProduct.get(key);
        if (prev) {
            return {
                productId: prev.productId,
                currentStock: prev.currentStock ?? 0,
                available: prev.available !== false,
                lastUpdated: prev.lastUpdated || new Date(),
            };
        }
        return {
            productId: productRef,
            currentStock: 0,
            available: true,
            lastUpdated: new Date(),
        };
    });

    const prevSig = inventory.items.map((i) => normalizeId(i.productId)).join("|");
    const nextSig = newItems.map((i) => normalizeId(i.productId)).join("|");
    if (prevSig !== nextSig || inventory.items.length !== newItems.length) {
        inventory.items = newItems;
        await inventory.save();
    }

    return VendorInventory.findOne({ vendorId }).populate({
        path: "items.productId",
        populate: { path: "category" },
    });
}
