import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from './app/models/product.js';
import Category from './app/models/category.js';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const seedCategories = async () => {
    try {
        // Read categories.json from frontend
        const categoriesPath = path.join(__dirname, '../frontend/src/modules/user/data/categories.json');
        const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));

        console.log(`\n📂 Found ${categoriesData.length} categories in JSON file`);

        // Create a map to store category ID mappings (string ID -> ObjectId)
        const categoryMap = {};

        // Process each category
        for (const catData of categoriesData) {
            // Check if category already exists
            let category = await Category.findOne({ name: catData.name });

            if (!category) {
                // Create new category
                category = await Category.create({
                    name: catData.name,
                    description: `${catData.name} category`,
                    image: catData.image || '',
                    isVisible: true
                });
                console.log(`  ✅ Created category: ${catData.name}`);
            } else {
                console.log(`  ⏭️  Category already exists: ${catData.name}`);
            }

            // Map the string ID from JSON to the MongoDB ObjectId
            categoryMap[catData.id] = category._id;
        }

        console.log(`\n✅ Categories processed successfully!`);
        return categoryMap;
    } catch (error) {
        console.error('❌ Error seeding categories:', error);
        throw error;
    }
};

const seedProducts = async (categoryMap) => {
    try {
        // Read products.json from frontend
        const productsPath = path.join(__dirname, '../frontend/src/modules/user/data/products.json');
        const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

        console.log(`\n📦 Found ${productsData.length} products in JSON file`);

        // Clear existing products (optional - comment out if you want to keep existing)
        const deleteResult = await Product.deleteMany({});
        console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing products\n`);

        // Helper function to normalize units to match the Product model enum
        const normalizeUnit = (unit) => {
            if (!unit) return 'kg';
            const unitLower = unit.toLowerCase();

            // Map various unit formats to the enum values
            if (unitLower.includes('kg')) return 'kg';
            if (unitLower.includes('g') && !unitLower.includes('kg')) return 'gm';
            if (unitLower.includes('pc') || unitLower.includes('piece') || unitLower === 'doz' || unitLower === 'dozen') return 'pcs';
            if (unitLower.includes('ltr') || unitLower.includes('litre') || unitLower.includes('liter')) return 'ltr';
            if (unitLower.includes('box') || unitLower.includes('basket') || unitLower.includes('pack')) return 'box';
            if (unitLower.includes('bunch') || unitLower.includes('head')) return 'pcs';

            // Default fallback
            return 'kg';
        };

        // Transform and insert products
        const transformedProducts = productsData.map(product => ({
            name: product.name,
            price: product.price,
            unit: normalizeUnit(product.unit),
            // Map category string ID to MongoDB ObjectId
            category: categoryMap[product.category] || null,
            primaryImage: product.image,
            images: product.images || [product.image],
            stock: product.stock || 0,
            description: product.description || '',
            shortDescription: product.shortDescription || '',
            bulkPricing: product.bulkPricing || [],
            comparePrice: product.comparePrice || null,
            bestPrice: product.bestPrice || null,
            status: 'active', // Set all imported products as active
            isVisible: true,
        }));

        // Filter out products with null categories
        const validProducts = transformedProducts.filter(p => p.category !== null);
        const invalidCount = transformedProducts.length - validProducts.length;

        if (invalidCount > 0) {
            console.log(`⚠️  Skipping ${invalidCount} products with invalid categories\n`);
        }

        // Insert products in batches
        const batchSize = 50;
        let insertedCount = 0;

        for (let i = 0; i < validProducts.length; i += batchSize) {
            const batch = validProducts.slice(i, i + batchSize);
            await Product.insertMany(batch);
            insertedCount += batch.length;
            console.log(`  ✅ Inserted ${insertedCount}/${validProducts.length} products`);
        }

        console.log('\n🎉 Product seeding completed successfully!');
        console.log(`📊 Total products in database: ${await Product.countDocuments()}`);

    } catch (error) {
        console.error('❌ Error seeding products:', error);
        throw error;
    }
};

// Run the seeder
const runSeeder = async () => {
    console.log('🚀 Starting seeder...\n');
    console.log('='.repeat(50));

    await connectDB();

    // First, seed categories and get the mapping
    const categoryMap = await seedCategories();

    // Then, seed products using the category mapping
    await seedProducts(categoryMap);

    console.log('='.repeat(50));
    console.log('\n🔌 Closing database connection...');
    await mongoose.connection.close();
    console.log('✅ Seeder completed successfully!\n');
    process.exit(0);
};

runSeeder().catch((error) => {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
});
