import Delivery from "../models/delivery.js";
import OTP from "../models/otp.js";
import handleResponse from "../utils/helper.js";
import { generateOTP, hashOTP, verifyHashedOTP } from "../utils/otpHelper.js";
import { sendSMS } from "../utils/smsService.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* 🔐 TOKEN */
const generateToken = (id) =>
  jwt.sign({ id, role: "delivery" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
/* ================= REGISTER DELIVERY ================= */
export const registerDelivery = async (req, res) => {
  try {
    const { fullName, mobile, vehicleNumber, vehicleType } = req.body;

    if (!fullName || !mobile || !vehicleNumber || !vehicleType) {
      return handleResponse(res, 400, "All fields are required");
    }

    if (!/^[6-9]\d{9}$/.test(mobile))
      return handleResponse(res, 400, "Invalid mobile number");

    if (!["bike", "scooter"].includes(vehicleType))
      return handleResponse(res, 400, "Invalid vehicle type");

    let delivery = await Delivery.findOne({ mobile });

    if (delivery && delivery.isVerified) {
      return handleResponse(res, 409, "Delivery partner already registered");
    }

    if (!delivery) {
      delivery = await Delivery.create({
        fullName,
        mobile,
        vehicleNumber,
        vehicleType,
      });
    }

    const devPhone = process.env.DELIVERY_DEFAULT_PHONE?.trim();
    // Check if an OTP was recently sent (cooldown)
    const existingOTP = await OTP.findOne({ mobile, role: "delivery" });
    if (existingOTP && mobile !== devPhone) {
      const timeDiff = (new Date() - existingOTP.updatedAt) / 1000;
      if (timeDiff < 15) {
        return handleResponse(res, 429, "Wait 15 seconds before requesting another OTP");
      }
    }

    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);

    await OTP.findOneAndUpdate(
      { mobile, role: "delivery" },
      {
        otp: hashedOtp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        verified: false,
      },
      { upsert: true, returnDocument: 'after' }
    );

    const smsSent = await sendSMS(mobile, otp);

    if (!smsSent && mobile !== devPhone) {
      // Delete the OTP record if sending failed so they can retry immediately
      await OTP.deleteOne({ mobile, role: "delivery" });
      return handleResponse(res, 500, "Failed to send SMS. Please try again later.");
    }

    return handleResponse(res, 200, "OTP sent for registration via SMS");
  } catch (err) {
    console.error("Delivery Register Error:", err);
    return handleResponse(res, 500, "Server error: " + err.message);
  }
};


/* ================= SEND OTP ================= */
export const sendDeliveryOTP = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile)
      return handleResponse(res, 400, "Mobile number required");

    if (!/^[6-9]\d{9}$/.test(mobile))
      return handleResponse(res, 400, "Invalid mobile number");

    let delivery = await Delivery.findOne({ mobile });

    const devPhone = process.env.DELIVERY_DEFAULT_PHONE?.trim();

    if (!delivery) {
      // ✅ Allow Auto-Register for DEV MODE Number
      if (mobile === devPhone) {
        delivery = await Delivery.create({
          mobile,
          fullName: "Dev Partner",
          vehicleNumber: "DEV-1234",
          vehicleType: "bike",
          isVerified: true,
          status: "active",
        });
      } else {
        // ❌ For other numbers, they must register first
        return handleResponse(res, 404, "Delivery partner not registered. Please register first.");
      }
    }

    if (delivery.status === "blocked")
      return handleResponse(res, 403, "Delivery partner blocked");

    // Check if an OTP was recently sent (cooldown)
    const existingOTP = await OTP.findOne({ mobile, role: "delivery" });
    if (existingOTP && mobile !== devPhone) {
      const timeDiff = (new Date() - existingOTP.updatedAt) / 1000;
      if (timeDiff < 15) {
        return handleResponse(res, 429, "Wait 15 seconds before requesting another OTP");
      }
    }

    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);

    await OTP.findOneAndUpdate(
      { mobile, role: "delivery" },
      {
        otp: hashedOtp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        verified: false,
      },
      { upsert: true }
    );

    await sendSMS(mobile, otp);

    return handleResponse(res, 200, "OTP sent via SMS");
  } catch (err) {
    // Cleanup OTP record on error if it was created
    await OTP.deleteOne({ mobile: req.body.mobile, role: "delivery" });
    return handleResponse(res, 500, "Server error");
  }
};

/* ================= VERIFY DELIVERY OTP ================= */
export const verifyDeliveryOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return handleResponse(res, 400, "Mobile & OTP required");
    }

    /* ✅ DEV MODE DEFAULT LOGIN */
    const isDevMode =
      mobile === process.env.DELIVERY_DEFAULT_PHONE?.trim() &&
      otp.toString() === process.env.DELIVERY_DEFAULT_OTP?.trim();

    if (isDevMode) {
      let delivery = await Delivery.findOne({ mobile });

      if (!delivery) {
        delivery = await Delivery.create({
          mobile,
          fullName: "Dev Partner",
          vehicleNumber: "DEV-1234",
          vehicleType: "bike",
          isVerified: true,
          status: "active",
        });
      }

      const token = generateToken(delivery._id);

      // Invalidate any existing OTP
      await OTP.deleteOne({ mobile, role: "delivery" });

      return handleResponse(res, 200, "Delivery login successful (DEV MODE)", {
        token,
        id: delivery._id,
        mobile: delivery.mobile,
        role: "delivery",
      });
    }

    /* 🔽 NORMAL OTP FLOW */
    const otpRecord = await OTP.findOne({ mobile, role: "delivery" });

    if (!otpRecord)
      return handleResponse(res, 404, "OTP not found or expired");

    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ mobile, role: "delivery" });
      return handleResponse(res, 400, "OTP expired");
    }

    const isMatch = await verifyHashedOTP(otp, otpRecord.otp);

    if (!isMatch) {
      return handleResponse(res, 400, "Invalid OTP");
    }

    const delivery = await Delivery.findOne({ mobile });

    if (!delivery)
      return handleResponse(res, 404, "Delivery user not found");

    if (delivery.status === "blocked")
      return handleResponse(res, 403, "Delivery partner blocked");

    delivery.isVerified = true;
    await delivery.save();

    // Delete OTP record after successful verification
    await OTP.deleteOne({ mobile, role: "delivery" });

    const token = generateToken(delivery._id);

    return handleResponse(res, 200, "Delivery login successful", {
      token,
      id: delivery._id,
      mobile: delivery.mobile,
      role: "delivery",
    });
  } catch (err) {
    console.error(err);
    return handleResponse(res, 500, "Server error: " + err.message);
  }
};

/* ================= GET ME ================= */
export const getDeliveryMe = async (req, res) => {
  return handleResponse(res, 200, "Delivery profile", req.delivery);
};

/* ================= FORGOT PASSWORD ================= */
export const forgotDeliveryPassword = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile)
      return handleResponse(res, 400, "Mobile required");

    const delivery = await Delivery.findOne({ mobile });

    if (!delivery)
      return handleResponse(res, 404, "Delivery user not found");

    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);

    await OTP.findOneAndUpdate(
      { mobile, role: "delivery" },
      {
        otp: hashedOtp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        verified: false,
      },
      { upsert: true }
    );

    await sendSMS(mobile, otp);

    return handleResponse(res, 200, "OTP sent for password reset via SMS");
  } catch (err) {
    return handleResponse(res, 500, "Server error");
  }
};

/* ================= RESET PASSWORD ================= */
export const resetDeliveryPassword = async (req, res) => {
  try {
    const { mobile, otp, newPassword } = req.body;

    if (!mobile || !otp || !newPassword)
      return handleResponse(res, 400, "All fields required");

    const delivery = await Delivery.findOne({ mobile });

    if (!delivery)
      return handleResponse(res, 404, "Delivery user not found");

    const otpRecord = await OTP.findOne({ mobile, role: "delivery" });
    if (!otpRecord)
      return handleResponse(res, 400, "OTP not found or expired");

    const isMatch = await verifyHashedOTP(otp, otpRecord.otp);
    if (!isMatch)
      return handleResponse(res, 400, "Invalid OTP");

    if (otpRecord.expiresAt < new Date())
      return handleResponse(res, 400, "OTP expired");

    delivery.password = await bcrypt.hash(newPassword, 10);
    await delivery.save();

    await OTP.deleteOne({ mobile, role: "delivery" });

    return handleResponse(res, 200, "Password reset successful");
  } catch (err) {
    return handleResponse(res, 500, "Server error");
  }
};
/* ================= UPDATE PROFILE ================= */
export const updateDeliveryProfile = async (req, res) => {
  try {
    const { fullName, vehicleNumber, vehicleType } = req.body;
    const delivery = await Delivery.findById(req.delivery._id);

    if (!delivery) return handleResponse(res, 404, "Delivery partner not found");

    if (fullName) delivery.fullName = fullName;
    if (vehicleNumber) delivery.vehicleNumber = vehicleNumber;
    if (vehicleType) {
      if (!["bike", "scooter"].includes(vehicleType)) {
        return handleResponse(res, 400, "Invalid vehicle type");
      }
      delivery.vehicleType = vehicleType;
    }

    await delivery.save();

    return handleResponse(res, 200, "Profile updated successfully", delivery);
  } catch (err) {
    console.error("Update profile error:", err);
    return handleResponse(res, 500, "Server error");
  }
};
