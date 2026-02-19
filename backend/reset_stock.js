import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = "mongodb+srv://prachi:7694900512@cluster0.nd3xlri.mongodb.net/krishikart?retryWrites=true&w=majority";

const inventorySchema = new mongoose.Schema({
    franchiseId: mongoose.Schema.Types.ObjectId,
    items: [{
        productId: mongoose.Schema.Types.ObjectId,
        currentStock: Number,
        mbq: Number,
        lastUpdated: Date
    }]
});

const productSchema = new mongoose.Schema({
    name: String
});

const Inventory = mongoose.model("Inventory", inventorySchema);
const Product = mongoose.model("Product", productSchema);

async function reset() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        const allProducts = await Product.find({});
        console.log(`Found ${allProducts.length} products`);

        const newItems = allProducts.map(p => ({
            productId: p._id,
            currentStock: 100,
            mbq: 5,
            lastUpdated: new Date()
        }));

        const inventories = await Inventory.find({});
        console.log(`Updating ${inventories.length} franchise inventories...`);

        for (const inv of inventories) {
            inv.items = newItems;
            await inv.save();
        }

        console.log("Successfully reset all inventory stocks to 100");
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

reset();
