import mongoose from "mongoose";

const masterAdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },

    password: {
      type: String,
      required: true,
    },

    otp: String,
    otpExpiresAt: Date,

    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },

    role: {
      type: String,
      default: "masteradmin",
    },
  },
  { timestamps: true }
);

export default mongoose.model("MasterAdmin", masterAdminSchema);
