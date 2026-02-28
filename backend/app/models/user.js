import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema(
  {
    txnId: { type: String, required: true },
    type: {
      type: String,
      enum: ["Added", "Paid", "Refund", "Credit Used", "Credit Refunded", "Adjustment", "Loyalty Bonus", "Redemption"],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, default: "Success" },
    note: { type: String, default: "" },
    referenceOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

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
    },

    walletTransactions: {
      type: [walletTransactionSchema],
      default: []
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
