import mongoose from 'mongoose';
import Order from './app/models/order.js';
import dotenv from 'dotenv';

dotenv.config();

const fixAndDebug = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const order = await Order.findById('699d72a55aacc6a5ded5ed65');

    if (order) {
        console.log('Order Status:', order.orderStatus);
        console.log('Franchise ID:', order.franchiseId);
        console.log('History:', JSON.stringify(order.statusHistory, null, 2));

        // Check for other orders in this state
        const problematicOrders = await Order.find({
            franchiseId: null,
            orderStatus: { $ne: 'Placed' }
        });

        console.log('Number of problematic orders (null franchise, not Placed):', problematicOrders.length);
        problematicOrders.forEach(o => {
            console.log(`- ID: ${o._id}, Status: ${o.orderStatus}`);
        });
    }

    process.exit(0);
};

fixAndDebug();
