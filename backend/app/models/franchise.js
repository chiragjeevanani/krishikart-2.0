import mongoose from "mongoose";

const franchiseSchema = new mongoose.Schema(
  {
    franchiseName: {
      type: String,
      required: true,
      trim: true,
    },

    ownerName: {
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

    city: {
      type: String,
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
      enum: ["pending", "active", "blocked"],
      default: "pending",
    },

    role: {
      type: String,
      default: "franchise",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Franchise", franchiseSchema);
