import mongoose from "mongoose";

const loyaltyConfigHistorySchema = new mongoose.Schema(
  {
    config: {
      awardRate: { type: Number, default: 5 },
      redemptionRate: { type: Number, default: 10 },
      minRedeemPoints: { type: Number, default: 100 },
    },
    changedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MasterAdmin",
      default: null,
      index: true,
    },
    changedByName: {
      type: String,
      default: "System",
    },
    changeNote: {
      type: String,
      default: "Loyalty settings updated",
    },
  },
  { timestamps: true },
);

export default mongoose.model("LoyaltyConfigHistory", loyaltyConfigHistorySchema);
