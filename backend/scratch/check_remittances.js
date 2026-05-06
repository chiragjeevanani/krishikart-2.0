import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const RemittanceSchema = new mongoose.Schema({}, { strict: false });
const Remittance = mongoose.model('DeliveryCodRemittance', RemittanceSchema);

async function checkRemittances() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const count = await Remittance.countDocuments({});
        console.log(`Total Remittances: ${count}`);

        const items = await Remittance.find({}).limit(5);
        console.log('Sample Remittances:', JSON.stringify(items, null, 2));

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkRemittances();
