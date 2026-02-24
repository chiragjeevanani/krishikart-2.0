import mongoose from 'mongoose';
import Order from './app/models/order.js';
import dotenv from 'dotenv';

dotenv.config();

const debug = async (id) => {
    await mongoose.connect(process.env.MONGO_URI);
    const order = await Order.findById(id);
    if (!order) {
        console.log('NOT FOUND');
    } else {
        console.log('ID:', order._id.toString());
        console.log('STATUS:', order.orderStatus);
        console.log('FRANCHISE_ID:', order.franchiseId ? order.franchiseId.toString() : 'NULL');
        console.log('CREATED_AT:', order.createdAt);
    }
    process.exit(0);
};

debug('699d72a55aacc6a5ded5ed65');
