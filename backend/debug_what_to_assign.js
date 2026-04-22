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

  // All categories
  const allCats = await Category.find({}).select('name _id').lean();
  const catMap = new Map(allCats.map(c => [c._id.toString(), c.name]));

  // appzeto franchise
  const franchise = await Franchise.findOne({ mobile: '9999999999' }).lean();
  const currentCatIds = (franchise.servedCategories || []).map(c => c.toString());
  const currentCatNames = currentCatIds.map(id => catMap.get(id) || id);

  console.log(`\nappzeto currently serves: ${currentCatNames.join(', ')}\n`);

  // All unassigned orders + their categories
  const unassigned = await Order.find({
    franchiseId: null,
    orderStatus: { $in: ['Placed', 'Assigned', 'pending'] }
  }).populate('items.productId', 'name category').populate('fulfillmentCategoryId', 'name').lean();

  console.log(`Total unassigned orders: ${unassigned.length}\n`);

  // Count by category
  const catOrderCount = new Map();
  for (const order of unassigned) {
    const catId = order.fulfillmentCategoryId?._id?.toString() || order.fulfillmentCategoryId?.toString();
    const catName = order.fulfillmentCategoryId?.name || catMap.get(catId) || 'Unknown';
    catOrderCount.set(catName, (catOrderCount.get(catName) || 0) + 1);
  }

  console.log('═══ UNASSIGNED ORDERS BY CATEGORY ═══');
  if (catOrderCount.size === 0) {
    console.log('No unassigned orders right now');
  } else {
    for (const [cat, count] of [...catOrderCount.entries()].sort((a,b) => b[1]-a[1])) {
      const alreadyServes = currentCatNames.includes(cat);
      console.log(`  ${cat}: ${count} order(s) ${alreadyServes ? '(already serving ✅)' : '← ADD THIS to get orders'}`);
    }
  }

  // All categories summary
  console.log('\n═══ ALL CATEGORIES IN SYSTEM ═══');
  for (const cat of allCats) {
    const serves = currentCatIds.includes(cat._id.toString());
    console.log(`  ${cat.name} (${cat._id}) ${serves ? '✅ already assigned' : ''}`);
  }

  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
