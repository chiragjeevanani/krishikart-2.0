import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ProductRecommendation from './app/models/productRecommendation.js';
import Product from './app/models/product.js';

dotenv.config();

async function checkRecs() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const recs = await ProductRecommendation.find().populate('sourceProduct recommendedProducts');
        console.log('Total recommendations:', recs.length);
        recs.forEach(r => {
            console.log(`Source: ${r.sourceProduct?.name} (${r.sourceProduct?._id})`);
            console.log(`Recs: ${r.recommendedProducts?.map(p => p.name).join(', ')}`);
            console.log(`Active: ${r.isActive}`);
            console.log('---');
        });

        const allProducts = await Product.find().limit(5);
        console.log('Sample products:', allProducts.map(p => `${p.name} (${p._id})`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkRecs();
