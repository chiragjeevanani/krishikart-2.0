import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
      match: [/^[6-9]\d{9}$/, "Invalid mobile number"],
    },

    vehicleNumber: {
      type: String,
      required: true,
      uppercase: true,
    },

    vehicleType: {
      type: String,
      enum: ["bike", "scooter"],
      required: true,
    },

    otp: String,
    otpExpiresAt: Date,
    otpAttempts: { type: Number, default: 0 },

    isVerified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Delivery", deliverySchema);
