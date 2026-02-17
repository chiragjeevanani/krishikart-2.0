import mongoose from 'mongoose';
import Product from './app/models/product.js';
import dotenv from 'dotenv';

dotenv.config();

const updateProductStatus = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Update all products to 'active' status
        const result = await Product.updateMany(
            { status: { $ne: 'active' } }, // Products that are NOT active
            { $set: { status: 'active' } }
        );

        console.log(`Updated ${result.modifiedCount} products to 'active' status`);

        // Show current product statuses
        const products = await Product.find({}, 'name status');
        console.log('\nCurrent product statuses:');
        products.forEach(p => console.log(`  - ${p.name}: ${p.status}`));

        process.exit(0);
    } catch (error) {
        console.error('Error updating products:', error);
        process.exit(1);
    }
};

updateProductStatus();
