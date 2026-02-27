import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './app/models/user.js';

dotenv.config();

async function setCredit() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const mobile = process.env.USER_DEFAULT_PHONE || '9999999999';
        const result = await User.findOneAndUpdate(
            { mobile },
            { creditLimit: 5000 },
            { new: true }
        );

        if (result) {
            console.log(`Updated User: ${result.fullName} (${result.mobile})`);
            console.log(`New Credit Limit: ${result.creditLimit}`);
        } else {
            console.log("User not found");
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

setCredit();
