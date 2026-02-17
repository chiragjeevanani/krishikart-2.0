import mongoose from 'mongoose';
import Order from './app/models/order.js';
import Franchise from './app/models/franchise.js';
import dotenv from 'dotenv';

dotenv.config();

const diagnoseFranchiseOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        // 1. Check if any franchises exist
        const franchises = await Franchise.find({});
        console.log(`=== FRANCHISES (${franchises.length}) ===`);
        franchises.forEach(f => {
            console.log(`ID: ${f._id}`);
            console.log(`Shop: ${f.shopName}`);
            console.log(`Status: ${f.status}`);
            console.log(`Mobile: ${f.mobile}\n`);
        });

        // 2. Check all orders and their franchise assignments
        const orders = await Order.find({}).populate('userId', 'fullName mobile');
        console.log(`=== ORDERS (${orders.length}) ===`);
        orders.forEach(o => {
            console.log(`Order ID: ${o._id}`);
            console.log(`User: ${o.userId?.fullName || 'Unknown'}`);
            console.log(`Status: ${o.orderStatus}`);
            console.log(`FranchiseId: ${o.franchiseId || 'NULL'}`);
            console.log(`Total: ₹${o.totalAmount}`);
            console.log(`---`);
        });

        // 3. Check if franchiseId matches any existing franchise
        const ordersWithFranchise = orders.filter(o => o.franchiseId);
        const ordersWithoutFranchise = orders.filter(o => !o.franchiseId);

        console.log(`\n=== SUMMARY ===`);
        console.log(`Total Orders: ${orders.length}`);
        console.log(`Orders WITH FranchiseId: ${ordersWithFranchise.length}`);
        console.log(`Orders WITHOUT FranchiseId: ${ordersWithoutFranchise.length}`);
        console.log(`Active Franchises: ${franchises.filter(f => f.status === 'active').length}`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

diagnoseFranchiseOrders();
