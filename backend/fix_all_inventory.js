import mongoose from "mongoose";
import dotenv from "dotenv";
import Inventory from "./app/models/inventory.js";
import Franchise from "./app/models/franchise.js";
import Product from "./app/models/product.js";

dotenv.config();

const superStockUpdate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const franchises = await Franchise.find({});
        const products = await Product.find({});

        console.log(`Processing ${franchises.length} franchises and ${products.length} products...`);

        for (const franchise of franchises) {
            let inventory = await Inventory.findOne({ franchiseId: franchise._id });

            if (!inventory) {
                console.log(`Creating missing inventory for franchise: ${franchise.franchiseName || franchise._id}`);
                inventory = new Inventory({
                    franchiseId: franchise._id,
                    items: []
                });
            }

            // Add/Update all products to this inventory with 50 stock
            for (const product of products) {
                const itemIndex = inventory.items.findIndex(
                    (item) => item.productId.toString() === product._id.toString()
                );

                if (itemIndex > -1) {
                    inventory.items[itemIndex].currentStock = 50;
                    inventory.items[itemIndex].lastUpdated = new Date();
                } else {
                    inventory.items.push({
                        productId: product._id,
                        currentStock: 50,
                        mbq: 5,
                        lastUpdated: new Date()
                    });
                }
            }

            await inventory.save();
            console.log(`Updated inventory for franchise: ${franchise.franchiseName || franchise._id}`);
        }

        console.log("All franchise inventories have been synced and stock set to 50 for all products.");
        process.exit(0);
    } catch (error) {
        console.error("Super Stock Update Error:", error);
        process.exit(1);
    }
};

superStockUpdate();
