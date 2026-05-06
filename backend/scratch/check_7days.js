import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const OrderSchema = new mongoose.Schema({}, { strict: false });
const Order = mongoose.model('Order', OrderSchema);

async function check7Days() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            last7Days.push(d);
        }

        for (const date of last7Days) {
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);
            const count = await Order.countDocuments({ createdAt: { $gte: date, $lt: nextDay } });
            const rev = await Order.aggregate([
                { $match: { createdAt: { $gte: date, $lt: nextDay }, orderStatus: { $ne: "Cancelled" } } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]);
            console.log(`${date.toDateString()}: Orders=${count}, Revenue=${rev[0]?.total || 0}`);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

check7Days();
