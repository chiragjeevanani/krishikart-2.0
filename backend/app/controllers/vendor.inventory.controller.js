import VendorInventory from "../models/vendorInventory.js";
import { handleResponse } from "../utils/helper.js";
import {
    isProductAssignedToVendor,
    syncInventoryToAssignedProducts,
} from "../utils/vendorInventorySync.js";

/**
 * @desc Get Vendor Inventory (only products assigned by admin)
 * @route GET /vendor/inventory
 * @access Private (Vendor)
 */
export const getVendorInventory = async (req, res) => {
    try {
        const vendorId = req.vendor._id;

        const inventory = await syncInventoryToAssignedProducts(vendorId);
        if (!inventory) {
            return handleResponse(res, 404, "Vendor not found");
        }

        const items = (inventory.items || []).filter((row) => row.productId != null);

        return handleResponse(res, 200, "Vendor inventory fetched successfully", items);
    } catch (err) {
        console.error("Get Vendor Inventory Error:", err);
        return handleResponse(res, 500, "Internal server error");
    }
};

/**
 * @desc Update Product Stock in Vendor Inventory
 * @route PUT /vendor/inventory/stock
 * @access Private (Vendor)
 */
export const updateVendorStock = async (req, res) => {
    try {
        const vendorId = req.vendor._id;
        const { productId, stock } = req.body;

        if (!productId || stock === undefined) {
            return handleResponse(res, 400, "Product ID and stock are required");
        }

        const assigned = await isProductAssignedToVendor(vendorId, productId);
        if (!assigned) {
            return handleResponse(res, 403, "This product is not assigned to your account");
        }

        await syncInventoryToAssignedProducts(vendorId);

        const inventory = await VendorInventory.findOne({ vendorId });
        if (!inventory) {
            return handleResponse(res, 404, "Inventory not found");
        }

        const itemIndex = inventory.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex > -1) {
            inventory.items[itemIndex].currentStock = stock;
            inventory.items[itemIndex].lastUpdated = new Date();
            await inventory.save();
            return handleResponse(res, 200, "Stock updated successfully");
        }

        return handleResponse(res, 404, "Product not found in inventory");
    } catch (err) {
        console.error("Update Vendor Stock Error:", err);
        return handleResponse(res, 500, "Internal server error");
    }
};

/**
 * @desc Toggle Product Availability
 * @route PUT /vendor/inventory/toggle-availability
 * @access Private (Vendor)
 */
export const toggleProductAvailability = async (req, res) => {
    try {
        const vendorId = req.vendor._id;
        const { productId } = req.body;

        if (!productId) {
            return handleResponse(res, 400, "Product ID is required");
        }

        const assigned = await isProductAssignedToVendor(vendorId, productId);
        if (!assigned) {
            return handleResponse(res, 403, "This product is not assigned to your account");
        }

        await syncInventoryToAssignedProducts(vendorId);

        const inventory = await VendorInventory.findOne({ vendorId });
        if (!inventory) {
            return handleResponse(res, 404, "Inventory not found");
        }

        const itemIndex = inventory.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex > -1) {
            inventory.items[itemIndex].available = !inventory.items[itemIndex].available;
            inventory.items[itemIndex].lastUpdated = new Date();
            await inventory.save();

            return handleResponse(res, 200, `Product is now ${inventory.items[itemIndex].available ? 'live' : 'hidden'}`);
        }

        return handleResponse(res, 404, "Product not found in inventory");
    } catch (err) {
        console.error("Toggle Availability Error:", err);
        return handleResponse(res, 500, "Internal server error");
    }
};
