import VendorInventory from "../models/vendorInventory.js";
import Vendor from "../models/vendor.js";
import Product from "../models/product.js";
import { handleResponse } from "../utils/helper.js";

/**
 * @desc Get Vendor Inventory
 * @route GET /vendor/inventory
 * @access Private (Vendor)
 */
export const getVendorInventory = async (req, res) => {
    try {
        const vendorId = req.vendor._id;

        let inventory = await VendorInventory.findOne({ vendorId }).populate({
            path: 'items.productId',
            populate: { path: 'category' }
        });

        // If no inventory found, initialize it with products assigned to the vendor
        if (!inventory) {
            const vendor = await Vendor.findById(vendorId);
            const assignedProductIds = vendor.products || [];

            inventory = new VendorInventory({
                vendorId,
                items: assignedProductIds.map(productId => ({
                    productId,
                    currentStock: 0,
                    available: true
                }))
            });
            await inventory.save();

            // Re-populate for consistent response
            inventory = await VendorInventory.findOne({ vendorId }).populate({
                path: 'items.productId',
                populate: { path: 'category' }
            });
        }

        return handleResponse(res, 200, "Vendor inventory fetched successfully", inventory.items);
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

        const inventory = await VendorInventory.findOne({ vendorId });
        if (!inventory) {
            return handleResponse(res, 404, "Inventory not found");
        }

        const itemIndex = inventory.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex > -1) {
            inventory.items[itemIndex].currentStock = stock;
            inventory.items[itemIndex].lastUpdated = new Date();
        } else {
            // If product not in inventory, add it
            inventory.items.push({
                productId,
                currentStock: stock,
                available: true,
                lastUpdated: new Date()
            });
        }

        await inventory.save();
        return handleResponse(res, 200, "Stock updated successfully");
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
        } else {
            return handleResponse(res, 404, "Product not found in inventory");
        }
    } catch (err) {
        console.error("Toggle Availability Error:", err);
        return handleResponse(res, 500, "Internal server error");
    }
};
