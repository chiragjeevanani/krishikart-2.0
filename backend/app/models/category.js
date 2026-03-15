import mongoose from "mongoose";
import { capitalizeFirst } from "../utils/helper.js";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            set: capitalizeFirst,
        },
        description: {
            type: String,
            trim: true,
        },
        image: {
            type: String,
            default: "",
        },
        isVisible: {
            type: Boolean,
            default: true,
        },
        adminCommission: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
