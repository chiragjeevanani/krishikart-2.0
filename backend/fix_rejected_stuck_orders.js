/**
 * Fix: Cancel all orders that were rejected by franchise and have no franchise assigned
 * COD orders — no refund needed, just cancel them
 */
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

  const stuckOrders = await Order.find({
    franchiseId: null,
    orderStatus: { $in: ['Placed', 'Assigned', 'pending'] },
    'assignmentAttempts.reason': 'rejected',
  }).lean();

  console.log(`Found ${stuckOrders.length} stuck rejected orders to fix\n`);

  for (const o of stuckOrders) {
    const order = await Order.findById(o._id);

    order.orderStatus = 'Cancelled';
    order.statusHistory.push({
      status: 'Cancelled',
      updatedAt: new Date(),
      updatedBy: 'system:no_franchise_available',
    });

    // Refund if wallet/UPI/card payment was completed
    if (
      (order.paymentMethod === 'Wallet' || ['UPI', 'Card'].includes(order.paymentMethod)) &&
      order.paymentStatus === 'Completed'
    ) {
      const user = await User.findById(order.userId);
      if (user) {
        user.walletBalance = Number((user.walletBalance + order.totalAmount).toFixed(2));
        user.walletTransactions = user.walletTransactions || [];
        user.walletTransactions.unshift({
          txnId: `REF-${Date.now()}`,
          type: 'Refund',
          amount: order.totalAmount,
          status: 'Success',
          note: `Refund for order ${order._id} — no franchise available`,
          referenceOrderId: order._id,
          createdAt: new Date(),
        });
        order.paymentStatus = 'Refunded';
        await user.save();
        console.log(`  💰 Refunded ₹${order.totalAmount} to user ${order.userId}`);
      }
    }

    await order.save();
    console.log(`✅ Cancelled order ${order._id} (was: ${o.orderStatus}, payment: ${o.paymentMethod})`);
  }

  console.log('\n🏁 Done');
  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
