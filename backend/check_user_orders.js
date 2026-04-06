import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import User from './app/models/user.js';
import Order from './app/models/order.js';

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);

    const user = await User.findOne({ mobile: '9999999999' });
    if (user) {
      const orders = await Order.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10);
      console.log('--- RECENT ORDERS ---');
      console.log(JSON.stringify(orders.map(o => ({
        _id: o._id,
        orderGroupId: o.orderGroupId,
        franchiseId: o.franchiseId,
        orderStatus: o.orderStatus,
        paymentStatus: o.paymentStatus,
        totalAmount: o.totalAmount,
        createdAt: o.createdAt,
        itemsCount: o.items.length,
        fulfillmentCategoryId: o.fulfillmentCategoryId
      })), null, 2));
    } else {
      console.log('User 9999999999 not found');
    }

    mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
