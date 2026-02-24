import mongoose from "mongoose";
import dotenv from "dotenv";
import Inventory from "./app/models/inventory.js";

dotenv.config();

const updateStock = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const inventories = await Inventory.find({});
        console.log(`Found ${inventories.length} inventories`);

        for (const inventory of inventories) {
            inventory.items.forEach(item => {
                item.currentStock = 50;
                item.lastUpdated = new Date();
            });
            await inventory.save();
            console.log(`Updated inventory for franchise: ${inventory.franchiseId}`);
        }

        console.log("Successfully updated all inventory items to 50kg");
        process.exit(0);
    } catch (error) {
        console.error("Error updating inventory:", error);
        process.exit(1);
    }
};

updateStock();
