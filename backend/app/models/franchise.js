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
    area: {
      type: String,
      default: null
    },
    state: {
      type: String,
      default: null
    },

    email: {
      type: String,
      trim: true,
      lowercase: true
    },

    profilePicture: {
      type: String,
      default: null
    },

    password: {
      type: String,
      select: false,
    },

    otp: String,
    otpExpiresAt: Date,
    otpAttempts: { type: Number, default: 0 },

    isVerified: {
      type: Boolean,
      default: false,
    },

    kyc: {
      aadhaarNumber: String,
      aadhaarImage: String,
      panNumber: String,
      panImage: String,
      status: {
        type: String,
        enum: ["unsubmitted", "pending", "verified", "rejected"],
        default: "unsubmitted",
      },
      submittedAt: Date,
      verifiedAt: Date,
      rejectionReason: String
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
    storeQRCode: {
      type: String,
      default: null, // URL to the franchise's UPI/Payment QR code
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        default: [0, 0]
      }
    },
    serviceHexagons: {
      type: [String],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isOnline: {
      type: Boolean,
      default: true
    },
    capacityAvailable: {
      type: Boolean,
      default: true
    },
    workingHours: {
      start: { type: String, default: "09:00" },
      end: { type: String, default: "21:00" }
    },
    fcmTokens: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

franchiseSchema.index({ location: "2dsphere" });

export default mongoose.model("Franchise", franchiseSchema);
