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
    price: Number,
    unit: String,
    status: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    dietaryType: String,
    unitValue: Number
});

const categorySchema = new mongoose.Schema({
    name: String,
    image: String
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

async function checkAtlas() {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        console.log('Connecting to:', uri);
        await mongoose.connect(uri);
        console.log('Connected to Atlas');

        const products = await Product.find({}).limit(5);
        console.log('DEBUG_ATLAS_START');
        console.log(JSON.stringify(products, null, 2));
        console.log('DEBUG_ATLAS_END');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkAtlas();
