import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import Order from './app/models/order.js';
import User from './app/models/user.js';
import Product from './app/models/product.js';
import Category from './app/models/category.js';

async function run() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('✅ Connected\n');

  // The 2 unassigned orders from today
  const orders = await Order.find({ franchiseId: null })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('userId', 'fullName mobile')
    .populate('user', 'fullName mobile')
    .populate('items.productId', 'name category price')
    .populate('fulfillmentCategoryId', 'name')
    .lean();

  for (const o of orders) {
    console.log('═══════════════════════════════════════════════');
    console.log(`Order ID     : ${o._id}`);
    console.log(`Status       : ${o.orderStatus}`);
    console.log(`Created      : ${o.createdAt}`);
    console.log(`paymentMethod: ${o.paymentMethod}`);
    console.log(`totalAmount  : ${o.totalAmount}`);
    console.log(`subtotal     : ${o.subtotal}`);
    console.log(`FulfillCat   : ${o.fulfillmentCategoryId?.name || o.fulfillmentCategoryId || 'null'}`);
    console.log(`orderGroupId : ${o.orderGroupId}`);

    // User info
    const user = o.userId || o.user;
    console.log(`userId field : ${o.userId?._id || o.userId || 'NULL'}`);
    console.log(`user field   : ${o.user?._id || o.user || 'NULL'}`);
    console.log(`User name    : ${user?.fullName || 'NOT POPULATED'}`);
    console.log(`User mobile  : ${user?.mobile || 'NOT POPULATED'}`);

    // Items
    console.log(`Items count  : ${o.items?.length || 0}`);
    if (o.items?.length > 0) {
      o.items.forEach((item, i) => {
        console.log(`  Item[${i}]: productId=${item.productId?._id || item.productId} | name=${item.productId?.name || item.name} | qty=${item.quantity} | price=${item.price}`);
      });
    } else {
      console.log('  ❌ items array is EMPTY');
    }

    // Shipping
    console.log(`ShippingAddr : ${o.shippingAddress}`);
    console.log(`Coords       : ${JSON.stringify(o.shippingLocation?.coordinates)}`);

    // Assignment attempts
    console.log(`Assignment Attempts: ${JSON.stringify(o.assignmentAttempts)}`);

    // City extraction simulation
    if (o.shippingAddress) {
      const parts = o.shippingAddress.split(',');
      const extractedCity = parts.length >= 2 ? parts[parts.length - 2].trim() : 'CANT EXTRACT';
      const lastPart = parts[parts.length - 1]?.trim();
      console.log(`City extracted (current logic) : "${extractedCity}"`);
      console.log(`Last part (state/pincode)      : "${lastPart}"`);
    }

    console.log('');
  }

  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
