import mongoose from 'mongoose';
import Order from './app/models/order.js';
import Franchise from './app/models/franchise.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const debugOrder = async (orderId) => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('--- Connected ---');

        const order = await Order.findById(orderId);
        if (!order) {
            console.log('ERROR: Order not found in database');
            process.exit(0);
        }

        console.log('JSON_START');
        console.log(JSON.stringify(order, null, 2));
        console.log('JSON_END');

        process.exit(0);
    } catch (error) {
        console.error('ERROR:', error);
        process.exit(1);
    }
};

debugOrder('699d72a55aacc6a5ded5ed65');
