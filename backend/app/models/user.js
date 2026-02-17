import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
      match: [/^[6-9]\d{9}$/, "Invalid mobile number"],
    },

    panNumber: {
      type: String,
      trim: true,
    },

    legalEntityName: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
    },

    profileImage: {
      type: String,
      default: "",
    },

    preferences: {
      whatsappUpdates: { type: Boolean, default: false },
      showTaxInclusive: { type: Boolean, default: false },
      paperInvoice: { type: Boolean, default: false },
    },

    otp: {
      type: String,
    },

    otpExpiresAt: {
      type: Date,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    password: {
      type: String,
    },

    walletBalance: {
      type: Number,
      default: 0
    },

    loyaltyPoints: {
      type: Number,
      default: 0
    },

    creditLimit: {
      type: Number,
      default: 0
    },

    usedCredit: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
