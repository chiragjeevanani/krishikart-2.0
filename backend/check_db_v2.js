const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Define minimal schemas if imports fail
const productSchema = new mongoose.Schema({
    name: String,
    primaryImage: String,
    status: String
});
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function checkProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/krishikart');
        console.log('Connected to DB');

        const products = await Product.find({}).limit(10);
        console.log('DATA_START');
        console.log(JSON.stringify(products, null, 2));
        console.log('DATA_END');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkProducts();
