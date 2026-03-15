/**
 * One-time script: Capitalize first letter of name for all
 * Products, Categories, and Subcategories in the database.
 * Run: node scripts/capitalize-names.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { capitalizeFirst } from '../app/utils/helper.js';

dotenv.config();

const Product = (await import('../app/models/product.js')).default;
const Category = (await import('../app/models/category.js')).default;
const Subcategory = (await import('../app/models/subcategory.js')).default;

async function run() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('MONGO_URI not set in .env');
        process.exit(1);
    }

    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB\n');

        let updated;

        // Categories (skip if capitalized name already exists on another doc to avoid unique key error)
        const categories = await Category.find({});
        updated = 0;
        for (const cat of categories) {
            const capped = capitalizeFirst(cat.name);
            if (cat.name !== capped) {
                const existing = await Category.findOne({ name: capped, _id: { $ne: cat._id } });
                if (existing) {
                    console.log(`  Category: skip "${cat.name}" (another category already named "${capped}")`);
                    continue;
                }
                await Category.updateOne({ _id: cat._id }, { $set: { name: capped } });
                updated++;
                console.log(`  Category: "${cat.name}" -> "${capped}"`);
            }
        }
        console.log(`Categories: ${updated} updated of ${categories.length}\n`);

        // Subcategories (unique per category; skip if same name already exists in same category)
        const subcategories = await Subcategory.find({});
        updated = 0;
        for (const sub of subcategories) {
            const capped = capitalizeFirst(sub.name);
            if (sub.name !== capped) {
                const existing = await Subcategory.findOne({ name: capped, category: sub.category, _id: { $ne: sub._id } });
                if (existing) {
                    console.log(`  Subcategory: skip "${sub.name}" (same category already has "${capped}")`);
                    continue;
                }
                await Subcategory.updateOne({ _id: sub._id }, { $set: { name: capped } });
                updated++;
                console.log(`  Subcategory: "${sub.name}" -> "${capped}"`);
            }
        }
        console.log(`Subcategories: ${updated} updated of ${subcategories.length}\n`);

        // Products
        const products = await Product.find({});
        updated = 0;
        for (const prod of products) {
            const capped = capitalizeFirst(prod.name);
            if (prod.name !== capped) {
                await Product.updateOne({ _id: prod._id }, { $set: { name: capped } });
                updated++;
                console.log(`  Product: "${prod.name}" -> "${capped}"`);
            }
        }
        console.log(`Products: ${updated} updated of ${products.length}\n`);

        console.log('Done. All names now start with a capital letter.');
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

run();
