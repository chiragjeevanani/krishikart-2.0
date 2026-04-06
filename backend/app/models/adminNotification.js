import mongoose from "mongoose";

const adminNotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: "general",
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      default: "",
      trim: true,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    readBy: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
  },
  { timestamps: true },
);

adminNotificationSchema.index({ createdAt: -1 });

export default mongoose.model("AdminNotification", adminNotificationSchema);
