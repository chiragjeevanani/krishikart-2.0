import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        mobile: {
            type: String,
            required: true,
            index: true,
        },
        role: {
            type: String,
            enum: ["user", "delivery", "franchise", "vendor"],
            required: true,
        },
        otp: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 }, // Automatically delete when expired
        },
        verified: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Compound index for faster lookups
otpSchema.index({ mobile: 1, role: 1 });

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
