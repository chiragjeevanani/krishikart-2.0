import mongoose from "mongoose";
import dotenv from "dotenv";
import Vendor from "../app/models/vendor.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const vendor = await Vendor.findOne({ email: "vendor@krishikart.com" });
        if (vendor) {
            console.log(`Email: ${vendor.email}, Mobile: ${vendor.mobile}, Status: ${vendor.status}`);
        } else {
            const anyVendor = await Vendor.findOne({ status: "active" });
            if (anyVendor) {
                console.log(`Any Active Vendor -> Email: ${anyVendor.email}, Mobile: ${anyVendor.mobile}, Status: ${anyVendor.status}`);
            } else {
                console.log("No vendors found");
            }
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
