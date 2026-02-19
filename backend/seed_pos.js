import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// Define Schemas directly to avoid import issues
const productSchema = new mongoose.Schema({
    name: String,
    primaryImage: String,
    price: Number,
    unit: String,
    status: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    dietaryType: String,
    unitValue: Number
});

const categorySchema = new mongoose.Schema({
    name: String,
    image: String
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

async function seedProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/krishikart');
        console.log('Connected to MongoDB');

        // 1. Create a default category if none exists
        let category = await Category.findOne({ name: 'Vegetables' });
        if (!category) {
            category = await Category.create({
                name: 'Vegetables',
                image: 'https://images.unsplash.com/photo-1566385101042-1a0004514901?w=800'
            });
            console.log('Category created');
        }

        // 2. Sample Products with high-quality images
        const sampleProducts = [
            {
                name: 'Hybrid Tomatoes',
                primaryImage: 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?w=800',
                price: 32,
                unit: 'kg',
                status: 'active',
                category: category._id,
                dietaryType: 'veg',
                unitValue: 1
            },
            {
                name: 'Red Onions',
                primaryImage: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=800',
                price: 45,
                unit: 'kg',
                status: 'active',
                category: category._id,
                dietaryType: 'veg',
                unitValue: 1
            },
            {
                name: 'Shimla Apples',
                primaryImage: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800',
                price: 180,
                unit: 'kg',
                status: 'active',
                category: category._id,
                dietaryType: 'veg',
                unitValue: 1
            },
            {
                name: 'Organic Spinach',
                primaryImage: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800',
                price: 40,
                unit: 'kg',
                status: 'active',
                category: category._id,
                dietaryType: 'veg',
                unitValue: 1
            },
            {
                name: 'Farm Fresh Milk',
                primaryImage: 'https://images.unsplash.com/photo-1550583724-125581cc258b?w=800',
                price: 60,
                unit: 'ltr',
                status: 'active',
                category: category._id,
                dietaryType: 'veg',
                unitValue: 1
            }
        ];

        for (const p of sampleProducts) {
            await Product.findOneAndUpdate({ name: p.name }, p, { upsert: true });
            console.log(`Product ${p.name} updated/seeded`);
        }

        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
}

seedProducts();
