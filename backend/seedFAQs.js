import dotenv from 'dotenv';
import mongoose from 'mongoose';
import FAQ from './app/models/faq.js';

dotenv.config();

const defaultFAQs = [
    {
        question: "How do I track my order on Kisaankart?",
        answer: "Go to the 'Orders' section in your profile. Select the order you want to track to see its current status, estimated delivery time, and delivery partner details. You can also get updates via SMS or notifications.",
        category: "Orders",
        displayOrder: 1,
        status: "active",
    },
    {
        question: "What is the return policy for seeds and agricultural products?",
        answer: "We have a 7-day return policy for most items. Seeds and fertilizers must be in unopened packaging for eligibility. Perishable or opened agri-inputs cannot be returned. Contact support for return requests.",
        category: "Returns",
        displayOrder: 2,
        status: "active",
    },
    {
        question: "How do I add money to my Kisaankart wallet?",
        answer: "Navigate to 'KK Wallet' from your profile, tap 'Add Money', enter the amount, and complete the payment using UPI, Card, or Net Banking. Wallet balance can be used for faster checkout on future orders.",
        category: "Payments",
        displayOrder: 3,
        status: "active",
    },
    {
        question: "Does Kisaankart deliver to my village or rural area?",
        answer: "Yes. We deliver through our franchise network and delivery partners across many rural and semi-urban areas. Enter your pin code at checkout to check availability. Delivery timelines may vary by location.",
        category: "Delivery",
        displayOrder: 4,
        status: "active",
    },
];

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    }
};

const seedFAQs = async () => {
    await connectDB();
    try {
        let added = 0;
        for (const faq of defaultFAQs) {
            const exists = await FAQ.findOne({ question: faq.question });
            if (!exists) {
                await FAQ.create(faq);
                added++;
            }
        }
        console.log(`✅ FAQ seed done. Added ${added} new FAQ(s). Total project FAQs are now visible on the user Help & Support page.`);
    } catch (err) {
        console.error('❌ Seed error:', err);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

seedFAQs();
