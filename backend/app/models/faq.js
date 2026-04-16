import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
            trim: true,
        },
        answer: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            default: "General",
            trim: true,
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
        audience: {
            type: String,
            enum: ["user", "vendor", "franchise", "delivery", "all"],
            default: "all",
        },
    },
    { timestamps: true }
);

export default mongoose.model("FAQ", faqSchema);
