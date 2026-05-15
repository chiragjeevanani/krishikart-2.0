import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ProcurementRequest from './app/models/procurementRequest.js';

dotenv.config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const requests = await ProcurementRequest.find();
        console.log(`Found ${requests.length} requests`);

        for (const req of requests) {
            if (!req.franchiseId) {
                console.warn(`Request ${req._id} is missing franchiseId!`);
            } else if (!mongoose.Types.ObjectId.isValid(req.franchiseId)) {
                console.error(`Request ${req._id} has invalid franchiseId: ${req.franchiseId}`);
            }
        }

        console.log("Diagnostic complete.");
        process.exit(0);
    } catch (err) {
        console.error("Diagnostic failed:", err);
        process.exit(1);
    }
};

checkData();
