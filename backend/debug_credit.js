import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './app/models/user.js';

dotenv.config();

async function checkCredit() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const usersWithCredit = await User.find({ creditLimit: { $gt: 0 } });
        console.log(`Found ${usersWithCredit.length} users with credit limit > 0`);

        usersWithCredit.forEach(u => {
            console.log(`User: ${u.fullName} (${u.mobile}) - Credit Limit: ${u.creditLimit}, Used: ${u.usedCredit}`);
        });

        const allUsers = await User.find().limit(5);
        console.log("\nSample of all users:");
        allUsers.forEach(u => {
            console.log(`User: ${u.fullName} (${u.mobile}) - Credit Limit: ${u.creditLimit}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkCredit();
