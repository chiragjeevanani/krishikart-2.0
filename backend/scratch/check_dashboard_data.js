import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const OrderSchema = new mongoose.Schema({}, { strict: false });
const Order = mongoose.model('Order', OrderSchema);

const VendorSchema = new mongoose.Schema({}, { strict: false });
const Vendor = mongoose.model('Vendor', VendorSchema);

const FranchiseSchema = new mongoose.Schema({}, { strict: false });
const Franchise = mongoose.model('Franchise', FranchiseSchema);

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const ordersToday = await Order.countDocuments({ createdAt: { $gte: today } });
        const activeVendors = await Vendor.countDocuments({ status: "active" });
        const activeFranchises = await Franchise.countDocuments({ status: "active" });
        const deliveriesInProgress = await Order.countDocuments({
            orderStatus: { $in: ["Placed", "Procuring", "Packed", "Dispatched"] }
        });

        console.log('Data Report:');
        console.log(`Orders Today: ${ordersToday}`);
        console.log(`Active Vendors: ${activeVendors}`);
        console.log(`Active Franchises: ${activeFranchises}`);
        console.log(`Deliveries In Progress: ${deliveriesInProgress}`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkData();
