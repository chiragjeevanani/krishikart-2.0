import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Delivery from './app/models/delivery.js';

dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const deliveries = await Delivery.find({});
        console.log('Total deliveries:', deliveries.length);
        deliveries.forEach(d => {
            console.log(`ID: ${d._id}, Name: ${d.fullName}, Mobile: ${d.mobile}, Status: ${d.status}`);
        });
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

test();
