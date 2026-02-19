import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const productSchema = new mongoose.Schema({
    name: String,
    primaryImage: String,
    images: [String],
    status: String
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function debugData() {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        await mongoose.connect(uri);
        console.log('Connected');

        const products = await Product.find({}).limit(5);

        const responseData = products.map(p => {
            const obj = p.toObject();
            return {
                productId: obj,
                currentStock: 10
            };
        });

        console.log('--- DATA FOR FRONTEND ---');
        console.log(JSON.stringify(responseData, null, 2));
        console.log('--- END ---');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugData();
