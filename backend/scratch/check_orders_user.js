import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const UserSchema = new mongoose.Schema({
    fullName: String,
    mobile: String,
    email: String
}, { timestamps: true });
const User = mongoose.model('User', UserSchema);

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    orderStatus: String,
    totalAmount: Number,
    shippingAddress: String,
    createdAt: Date
}, { timestamps: true });
const Order = mongoose.model('Order', OrderSchema);

async function checkOrders() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const mobiles = ['6268423925', '6268715409'];
        
        for (const mobile of mobiles) {
            console.log(`\nChecking mobile: ${mobile}`);
            const user = await User.findOne({ mobile });
            if (user) {
                console.log(`User found: ID=${user._id}, Name=${user.fullName}`);
                const orders = await Order.find({ userId: user._id }).limit(5);
                console.log(`Orders found for this user ID: ${orders.length}`);
                if (orders.length > 0) {
                    console.log('Shipping addresses:', orders.map(o => o.shippingAddress));
                }
            } else {
                console.log('User not found in User collection');
            }

            // Check if any orders have this mobile but no userId or different userId
            const ordersByMobile = await Order.find({ 
                $or: [
                    { 'userId.mobile': mobile }, // If populated? No, userId is just an ID.
                    { 'shippingAddress': new RegExp(mobile) } // Maybe mobile is in address?
                ]
            }).limit(5);
            // Wait, I should check the userId field directly if it's not populated
            const allOrders = await Order.find().populate('userId').limit(100);
            const matches = allOrders.filter(o => o.userId?.mobile === mobile);
            console.log(`Total orders found with this mobile in populated userId: ${matches.length}`);
            if (matches.length > 0) {
                console.log('Sample match:', JSON.stringify({
                    _id: matches[0]._id,
                    userId: matches[0].userId,
                    orderStatus: matches[0].orderStatus
                }, null, 2));
            }
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkOrders();
