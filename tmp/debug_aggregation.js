
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './backend/app/models/order.js';
import Product from './backend/app/models/product.js';
import Category from './backend/app/models/category.js';
import Franchise from './backend/app/models/franchise.js';
import Vendor from './backend/app/models/vendor.js';
import DeliveryCodRemittance from './backend/app/models/deliveryCodRemittance.js';

dotenv.config({ path: './backend/.env' });

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Test aggregation logic from getAdminAnalyticsStats
        console.log('Testing Category Distribution Aggregation...');
        const categoryDist = await Order.aggregate([
            { $match: { orderStatus: { $ne: "Cancelled" } } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            { $unwind: "$productInfo" },
            {
                $lookup: {
                    from: "categories",
                    localField: "productInfo.category",
                    foreignField: "_id",
                    as: "categoryInfo"
                }
            },
            { $unwind: "$categoryInfo" },
            {
                $group: {
                    _id: "$categoryInfo.name",
                    totalValue: { $sum: "$items.subtotal" }
                }
            }
        ]);
        console.log('Category Dist Result:', JSON.stringify(categoryDist, null, 2));

        console.log('Testing Regional Performance Aggregation...');
        const [regionalPerfRaw, regionalNodes] = await Promise.all([
            Order.aggregate([
                { $group: { _id: "$shippingLocation.city", orderCount: { $sum: 1 }, delivered: { $sum: { $cond: [{ $eq: ["$orderStatus", "Delivered"] }, 1, 0] } } } }
            ]),
            Franchise.aggregate([
                { $group: { _id: "$city", nodeCount: { $sum: 1 } } }
            ])
        ]);
        console.log('Regional Perf Raw:', JSON.stringify(regionalPerfRaw, null, 2));

        process.exit(0);
    } catch (err) {
        console.error('ERROR:', err);
        process.exit(1);
    }
}

test();
