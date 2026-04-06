import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

// Since the models use ESM, and I'm running a script, I might need to use dynamic imports or just redefine minimal schemas.
// But let's try importing the actual model if backend is set up for ESM.
import Franchise from '../backend/app/models/franchise.js';

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Searching for franchises by common test mobile numbers mentioned by user
    const mobiles = ['9999', '8989', '9999000000', '8989000000', '99990000', '89890000'];
    const franchises = await Franchise.find({ mobile: { $in: mobiles } });
    console.log('--- FRANCHISES ---');
    console.log(JSON.stringify(franchises, null, 2));

    const allFranchises = await Franchise.find({ status: 'active' }).select('mobile franchiseName location isActive isOnline');
    console.log('--- ALL ACTIVE FRANCHISES ---');
    console.log(JSON.stringify(allFranchises, null, 2));

    mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
