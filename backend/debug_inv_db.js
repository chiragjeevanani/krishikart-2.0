import mongoose from "mongoose";
import dotenv from "dotenv";
import Inventory from "./app/models/inventory.js";
import Franchise from "./app/models/franchise.js";
import Product from "./app/models/product.js";

dotenv.config();

const debugInventory = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const franchises = await Franchise.find({});
        console.log(`Found ${franchises.length} franchises`);

        const products = await Product.find({});
        console.log(`Found ${products.length} products`);

        const inventories = await Inventory.find({});
        console.log(`Found ${inventories.length} inventory records`);

        for (const inv of inventories) {
            console.log(`Franchise ID: ${inv.franchiseId}, Items Count: ${inv.items?.length || 0}`);
        }

        process.exit(0);
    } catch (error) {
        console.error("Error debugging inventory:", error);
        process.exit(1);
    }
};

debugInventory();
