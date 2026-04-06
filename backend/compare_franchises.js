import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import Franchise from './app/models/franchise.js';

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);

    const mobiles = ['9109599487', '7458947838'];
    const franchises = await Franchise.find({ mobile: { $in: mobiles } });
    console.log('--- FRANCHISES COMPARISON ---');
    console.log(JSON.stringify(franchises.map(f => ({
      _id: f._id,
      name: f.franchiseName,
      mobile: f.mobile,
      servedCategories: f.servedCategories,
      location: f.location,
      isActive: f.isActive,
      isOnline: f.isOnline,
      workingHours: f.workingHours
    })), null, 2));

    mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
