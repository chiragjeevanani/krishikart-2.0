import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import Franchise from './app/models/franchise.js';
import Category from './app/models/category.js';
import Order from './app/models/order.js';
import Product from './app/models/product.js';

async function run() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('✅ Connected\n');

  // 1. Find Herbs category
  console.log('═══ HERBS CATEGORY ═══');
  const herbsCat = await Category.findOne({ name: { $regex: /herb/i } }).lean();
  if (!herbsCat) {
    console.log('❌ No category found with name matching "herb"');
    const allCats = await Category.find({}).select('name _id').lean();
    console.log('All categories:');
    allCats.forEach(c => console.log(`  ${c.name} (${c._id})`));
  } else {
    console.log(`✅ Found: ${herbsCat.name} (${herbsCat._id})`);
  }

  // 2. Which franchises serve Herbs
  console.log('\n═══ FRANCHISES SERVING HERBS ═══');
  if (herbsCat) {
    const franchisesWithHerbs = await Franchise.find({
      $or: [
        { servedCategories: herbsCat._id },
        { servedCategories: { $size: 0 } },
        { servedCategories: { $exists: false } },
      ]
    }).select('franchiseName mobile servedCategories status isVerified isActive isOnline').lean();

    if (!franchisesWithHerbs.length) {
      console.log('❌ NO franchise serves Herbs category!');
    } else {
      franchisesWithHerbs.forEach(f => {
        const servesAll = !f.servedCategories?.length;
        console.log(`  ${f.franchiseName} (${f.mobile})`);
        console.log(`    status=${f.status} isVerified=${f.isVerified} isActive=${f.isActive} isOnline=${f.isOnline}`);
        console.log(`    servedCategories: ${servesAll ? 'ALL (empty = legacy)' : JSON.stringify(f.servedCategories)}`);
      });
    }
  }

  // 3. Unassigned orders with Herbs
  console.log('\n═══ UNASSIGNED ORDERS WITH HERBS ═══');
  if (herbsCat) {
    const herbOrders = await Order.find({
      franchiseId: null,
      'items.0': { $exists: true },
    }).populate('items.productId', 'name category').lean();

    const herbUnassigned = herbOrders.filter(o =>
      o.items.some(i => i.productId?.category?.toString() === herbsCat._id.toString())
    );

    if (!herbUnassigned.length) {
      console.log('No unassigned orders with Herbs products');
    } else {
      herbUnassigned.forEach(o => {
        console.log(`  Order: ${o._id} | status: ${o.orderStatus} | created: ${o.createdAt}`);
        o.items.forEach(i => console.log(`    → ${i.productId?.name} (cat: ${i.productId?.category})`));
      });
    }
  }

  // 4. All franchises and their categories
  console.log('\n═══ ALL FRANCHISES + THEIR CATEGORIES ═══');
  const allFranchises = await Franchise.find({ status: 'active' })
    .select('franchiseName mobile servedCategories isOnline isActive isVerified')
    .populate('servedCategories', 'name')
    .lean();

  allFranchises.forEach(f => {
    const cats = f.servedCategories?.length
      ? f.servedCategories.map(c => c.name || c).join(', ')
      : 'ALL CATEGORIES (empty)';
    console.log(`  ${f.franchiseName} (${f.mobile})`);
    console.log(`    online=${f.isOnline} active=${f.isActive} verified=${f.isVerified}`);
    console.log(`    serves: ${cats}`);
  });

  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
