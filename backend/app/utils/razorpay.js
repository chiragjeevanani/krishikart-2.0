import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always load backend/.env regardless of current working directory.
const envPath = path.resolve(__dirname, '../../.env');
const result = dotenv.config({ path: envPath, override: true });

console.log('Razorpay Init - envPath:', envPath);
console.log('Dotenv Load Result:', result.error ? 'Error: ' + result.error.message : 'Success');
console.log('RAZORPAY_KEY_ID Value:', `"${process.env.RAZORPAY_KEY_ID}"`);

if (!process.env.RAZORPAY_KEY_ID) {
    console.error('CRITICAL: RAZORPAY_KEY_ID is missing from environment!');
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'missing_key_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'missing_key_secret',
});

export default razorpay;
