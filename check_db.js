import mongoose from 'mongoose';
import Product from './backend/app/models/product.js';
import Category from './backend/app/models/category.js';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

async function checkProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/krishikart');
        console.log('Connected to DB');

        const products = await Product.find({}).limit(10);
        console.log('Total Products:', await Product.countDocuments());
        console.log('Sample Products:', JSON.stringify(products, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkProducts();
