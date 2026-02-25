import mongoose from "mongoose";
import dotenv from "dotenv";
import MasterAdmin from "./app/models/masteradmin.js";

dotenv.config();

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admin = await MasterAdmin.findOne({});
        if (admin) {
            console.log("Admin exists:", admin.email);
        } else {
            console.log("No MasterAdmin found.");
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

check();
