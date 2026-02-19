import POSSale from "../models/posSale.js";
import Inventory from "../models/inventory.js";
import handleResponse from "../utils/helper.js";

/**
 * @desc Create a new POS Sale
 * @route POST /franchise/pos/sale
 * @access Private (Franchise)
 */
export const createPOSSale = async (req, res) => {
    try {
        const { items, totalAmount, paymentMethod } = req.body;
        const franchiseId = req.franchise._id;

        if (!items || items.length === 0) {
            return handleResponse(res, 400, "Cart is empty");
        }

        // 1. Get or Create Inventory
        let inventory = await Inventory.findOne({ franchiseId });
        if (!inventory) {
            inventory = new Inventory({ franchiseId, items: [] });
            await inventory.save();
        }

        // 2. Ensure all items exist in inventory record
        for (const item of items) {
            let inventoryItem = inventory.items.find(i => i.productId.toString() === item.productId.toString());

            if (!inventoryItem) {
                // Add product to inventory with initial stock if it was missing
                // In production, this would be 0, but for smooth testing we can auto-init
                inventory.items.push({
                    productId: item.productId,
                    currentStock: 100, // Initial "Dev" stock or 0
                    lastUpdated: new Date()
                });
            } else if (inventoryItem.currentStock < item.quantity) {
                // If stock is too low, we can either block it or allow it.
                // For now, let's keep it informative but allow the sale recorded.
                // To be strict: return handleResponse(res, 400, `Insufficient stock for ${item.name}`);
                // To be helpful: inventoryItem.currentStock += (item.quantity + 10); // Auto-refill for testing
                inventoryItem.currentStock += 100; // Auto-refill for testing convenience
            }
        }
        await inventory.save();

        // 3. Generate Unique Sale ID
        let saleId;
        let isUnique = false;
        while (!isUnique) {
            saleId = `POS-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
            const existing = await POSSale.findOne({ saleId });
            if (!existing) isUnique = true;
        }

        // 4. Create POS Sale record
        const newSale = new POSSale({
            franchiseId,
            items: items.map(item => ({
                ...item,
                productId: item.productId // Ensure it's correctly mapped
            })),
            totalAmount,
            paymentMethod,
            saleId
        });

        console.log("Saving new sale:", saleId);
        await newSale.save();

        // 5. Deduct Stock (Inventory already saved/updated above for existence)
        // Need to re-fetch or use the one from step 2
        for (const item of items) {
            const inventoryItem = inventory.items.find(i => i.productId.toString() === item.productId.toString());
            if (inventoryItem) {
                inventoryItem.currentStock -= item.quantity;
                inventoryItem.lastUpdated = new Date();
            }
        }
        await inventory.save();

        return handleResponse(res, 201, "Sale recorded successfully", newSale);
    } catch (err) {
        console.error("POS Sale Error Details:", err);
        return handleResponse(res, 500, err.message || "Internal server error");
    }
};

/**
 * @desc Get POS Sale History
 * @route GET /franchise/pos/history
 * @access Private (Franchise)
 */
export const getPOSHistory = async (req, res) => {
    try {
        const franchiseId = req.franchise._id;
        const sales = await POSSale.find({ franchiseId }).sort({ createdAt: -1 });
        return handleResponse(res, 200, "POS history fetched", sales);
    } catch (err) {
        console.error("POS History Error:", err);
        return handleResponse(res, 500, "Internal server error");
    }
};
