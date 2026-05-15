import mongoose from "mongoose";
import Inventory from "./app/models/inventory.js";
import ProcurementRequest from "./app/models/procurementRequest.js";
import Order from "./app/models/order.js";

async function diagnostic() {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/krishikart");
    
    // 1. Get the most recent completed procurement request
    const latestPR = await ProcurementRequest.findOne({ status: 'completed' }).sort({ updatedAt: -1 });
    
    if (latestPR) {
        console.log(`Latest Completed PR: ${latestPR._id}`);
        console.log(`Order ID: ${latestPR.orderId}`);
        console.log(`Franchise ID: ${latestPR.franchiseId}`);
        
        // 2. Check Order items
        if (latestPR.orderId) {
            const order = await Order.findById(latestPR.orderId);
            if (order) {
                console.log(`\nOrder ${order._id} Status: ${order.orderStatus}`);
                console.log(`Order Items:`);
                order.items.forEach(item => {
                    console.log(` - ${item.name} (ProdId: ${item.productId}): Qty=${item.quantity}, isShortage=${item.isShortage}, shortageQty=${item.shortageQty}`);
                });
            } else {
                console.log(`\nOrder ${latestPR.orderId} not found.`);
            }
        }
        
        console.log(`\nItems in PR:`);
        latestPR.items.forEach(item => {
            console.log(` - ${item.name} (ProdId: ${item.productId}): Dispatched=${item.dispatchedQuantity}, Received=${item.receivedQuantity}, Damaged=${item.damagedQuantity}, Rejected=${item.rejected}`);
        });
        
        // 3. Check inventory for this franchise
        const inventory = await Inventory.findOne({ franchiseId: latestPR.franchiseId });
        if (inventory) {
            console.log(`\nInventory for Franchise ${latestPR.franchiseId}:`);
            inventory.items.forEach(item => {
                console.log(` - ProdId: ${item.productId}, Stock: ${item.currentStock}, LastUpdated: ${item.lastUpdated}`);
            });
        }
    } else {
        console.log("No completed procurement requests found.");
    }
    
    await mongoose.disconnect();
}

diagnostic().catch(console.error);
