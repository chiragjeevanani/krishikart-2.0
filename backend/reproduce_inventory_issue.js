import mongoose from "mongoose";
import Inventory from "./app/models/inventory.js";
import Product from "./app/models/product.js";
import Franchise from "./app/models/franchise.js";
import { getStorefrontOffersByProduct } from "./app/utils/storefrontAvailability.js";

async function reproduce() {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/krishikart");
    
    // 1. Setup a mock franchise that serves a category
    const franchise = await Franchise.findOne({ isActive: true, status: 'active' });
    if (!franchise) {
        console.log("No active franchise found");
        process.exit(0);
    }
    
    console.log(`Franchise: ${franchise.franchiseName}, Served Categories: ${franchise.servedCategories.length}`);
    
    // 2. Find a product in one of those categories
    let product;
    if (franchise.servedCategories.length > 0) {
        product = await Product.findOne({ category: { $in: franchise.servedCategories }, status: 'active' });
    }
    
    if (!product) {
        console.log("No suitable product found for test");
        process.exit(0);
    }
    
    console.log(`Testing Product: ${product.name} (ID: ${product._id})`);
    
    // 3. Check inventory for this product
    const inventory = await Inventory.findOne({ franchiseId: franchise._id });
    if (inventory) {
        const item = (inventory.items || []).find(i => i.productId.toString() === product._id.toString());
        if (item) {
            console.log(`Current Stock in Inventory: ${item.currentStock}`);
        } else {
            console.log("Product not in inventory items array (Equivalent to 0 stock).");
        }
    } else {
        console.log("No inventory record for franchise (Equivalent to 0 stock).");
    }
    
    // 4. Run the availability check
    const offers = await getStorefrontOffersByProduct(
        franchise.location.coordinates[1],
        franchise.location.coordinates[0],
        franchise.city
    );
    
    const offer = offers.get(product._id.toString());
    if (offer) {
        console.log("RESULT: Product IS AVAILABLE for checkout despite potential 0 stock.");
        console.log("Offer Data:", offer);
    } else {
        console.log("RESULT: Product IS NOT AVAILABLE.");
    }
    
    await mongoose.disconnect();
}

reproduce().catch(err => {
    console.error(err);
    process.exit(1);
});
