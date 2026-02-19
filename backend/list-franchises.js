import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Franchise from './app/models/franchise.js';

dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const franchises = await Franchise.find({});
        console.log(`Total franchises: ${franchises.length}`);
        franchises.forEach(f => {
            console.log(`Name: ${f.franchiseName}, Status: ${f.status}, Location:`, f.location);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

test();
