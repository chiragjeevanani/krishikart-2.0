import mongoose from "mongoose";
import dotenv from "dotenv";
import Vendor from "./app/models/vendor.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("Connected to MongoDB");
        const vendors = await Vendor.find({});
        console.log(`Found ${vendors.length} vendors:`);
        vendors.forEach(v => {
            console.log(`ID: ${v._id}, Email: ${v.email}, Status: ${v.status}, Role: ${v.role}`);
        });
        process.exit(0);
    })
    .catch(err => {
        console.error("Connection error:", err);
        process.exit(1);
    });
