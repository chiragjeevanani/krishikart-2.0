import mongoose from 'mongoose';
import Order from './app/models/order.js';
import dotenv from 'dotenv';

dotenv.config();

const debugHistory = async (id) => {
    await mongoose.connect(process.env.MONGO_URI);
    const order = await Order.findById(id);
    if (!order) {
        console.log('NOT FOUND');
    } else {
        console.log('ORDER:', JSON.stringify(order, null, 2));
    }
    process.exit(0);
};

debugHistory('699d72a55aacc6a5ded5ed65');
