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

async function run() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('✅ Connected\n');

  // Find all orders that were rejected by franchise and are still unassigned
  const rejectedUnassigned = await Order.find({
    franchiseId: null,
    'assignmentAttempts.reason': 'rejected',
  }).sort({ createdAt: -1 }).populate('userId', 'fullName mobile').lean();

  console.log(`Found ${rejectedUnassigned.length} orders rejected by franchise and still unassigned:\n`);

  for (const o of rejectedUnassigned) {
    console.log(`Order: ${o._id}`);
    console.log(`  status       : ${o.orderStatus}`);
    console.log(`  paymentMethod: ${o.paymentMethod}`);
    console.log(`  paymentStatus: ${o.paymentStatus}`);
    console.log(`  totalAmount  : ${o.totalAmount}`);
    console.log(`  customer     : ${o.userId?.fullName || 'Guest'} (${o.userId?.mobile || 'no mobile'})`);
    console.log(`  items        : ${o.items?.length || 0}`);
    console.log(`  created      : ${o.createdAt}`);
    console.log(`  attempts     : ${JSON.stringify(o.assignmentAttempts?.map(a => ({ reason: a.reason, franchise: a.franchiseId })))}`);
    console.log('');
  }

  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
