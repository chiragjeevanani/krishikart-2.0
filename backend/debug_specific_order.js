import mongoose from 'mongoose';
import Order from './app/models/order.js';
import Franchise from './app/models/franchise.js';
import dotenv from 'dotenv';

dotenv.config();

const debugOrder = async (orderId) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const order = await Order.findById(orderId);
        if (!order) {
            console.log('Order not found');
            process.exit(0);
        }

        console.log('=== ORDER DETAILS ===');
        console.log('ID:', order._id);
        console.log('Status:', order.orderStatus);
        console.log('FranchiseId:', order.franchiseId);

        if (order.franchiseId) {
            const franchise = await Franchise.findById(order.franchiseId);
            if (franchise) {
                console.log('Assigned Franchise:', franchise.shopName, `(${franchise._id})`);
            } else {
                console.log('Assigned Franchise ID does not exist in Franchise collection!');
            }
        } else {
            console.log('Order is UNASSIGNED (Broadcast mode)');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

const orderId = '699d72a55aacc6a5ded5ed65';
debugOrder(orderId);
