/**
 * MANUAL FIX SCRIPT: Reassign all unassigned orders using the fixed assignment logic
 * Run: node reassign_unassigned_orders.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import Order from './app/models/order.js';
import Product from './app/models/product.js';
import { assignOrderToFranchise } from './app/utils/assignment.js';

async function run() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  const unassignedOrders = await Order.find({
    franchiseId: null,
    orderStatus: { $in: ['Placed', 'Assigned', 'pending'] },
  }).sort({ createdAt: -1 });

  console.log(`Found ${unassignedOrders.length} unassigned orders\n`);

  for (const order of unassignedOrders) {
    console.log(`\n─────────────────────────────────────`);
    console.log(`Order: ${order._id}`);
    console.log(`Status: ${order.orderStatus}`);
    console.log(`Created: ${order.createdAt}`);
    console.log(`Address: ${order.shippingAddress}`);
    console.log(`Attempting reassignment...`);

    try {
      const success = await assignOrderToFranchise(order._id.toString());
      if (success) {
        console.log(`✅ Successfully assigned!`);
      } else {
        console.log(`❌ Assignment failed — no eligible franchise found`);
      }
    } catch (err) {
      console.error(`❌ Error during assignment:`, err.message);
    }
  }

  console.log(`\n═══════════════════════════════════════`);
  console.log(`🏁 Reassignment complete`);
  console.log(`═══════════════════════════════════════\n`);

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
});
