import User from "../models/user.js";
import OTP from "../models/otp.js";
import WalletRecharge from "../models/walletRecharge.js";
import GlobalSetting from "../models/globalSetting.js";
import handleResponse from "../utils/helper.js";
import { generateOTP, hashOTP, verifyHashedOTP } from "../utils/otpHelper.js";
import { sendSMS } from "../utils/smsService.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import razorpay from "../utils/razorpay.js";


/**
 * SEND OTP
 */
export const sendOTP = async (req, res) => {
  try {
    const { mobile } = req.body;

    // Validation
    if (!mobile) {
      return handleResponse(res, 400, "Mobile number is required");
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return handleResponse(res, 400, "Invalid mobile number");
    }

    let user = await User.findOne({ mobile });

    // Auto-register if user not exists
    if (!user) {
      user = await User.create({ mobile });
    }

    const devPhone = process.env.USER_DEFAULT_PHONE?.trim();

    // Check if an OTP was recently sent (cooldown)
    const existingOTP = await OTP.findOne({ mobile, role: "user" });
    if (existingOTP && mobile !== devPhone) {
      const timeDiff = (new Date() - existingOTP.updatedAt) / 1000;
      if (timeDiff < 15) {
        return handleResponse(
          res,
          429,
          "Please wait 15 seconds before requesting another OTP"
        );
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);

    // Save/Update OTP in database
    await OTP.findOneAndUpdate(
      { mobile, role: "user" },
      {
        otp: hashedOtp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
        verified: false,
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Send SMS via SMS India API
    const smsSent = await sendSMS(mobile, otp);

    if (!smsSent && mobile !== devPhone) {
      // Delete the OTP record if sending failed so they can retry immediately
      await OTP.deleteOne({ mobile, role: "user" });
      return handleResponse(res, 500, "Failed to send SMS. Please try again later.");
    }

    // ❌ No console.log(otp)

    return handleResponse(res, 200, "OTP sent successfully via SMS");
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, "Internal server error");
  }
};


export const verifyOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return handleResponse(res, 400, "Mobile & OTP are required");
    }

    /* ✅ DEV MODE LOGIN */
    const isDevMode =
      mobile === process.env.USER_DEFAULT_PHONE?.trim() &&
      otp.toString() === process.env.USER_DEFAULT_OTP?.trim();

    if (isDevMode) {
      let user = await User.findOne({ mobile });

      if (!user) {
        user = await User.create({
          mobile,
          fullName: "Dev User",
          isVerified: true,
        });
      }

      const token = jwt.sign(
        { id: user._id, role: "user" },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Invalidate any existing OTP for this user
      await OTP.deleteOne({ mobile, role: "user" });

      return handleResponse(res, 200, "Login successful (DEV MODE)", {
        token,
        user: {
          id: user._id,
          mobile: user.mobile,
          fullName: user.fullName || "Dev User",
          role: "user",
          onboardingCompleted: user.onboardingCompleted || false,
          businessType: user.businessType || null,
        },
      });
    }

    /* 🔽 NORMAL OTP FLOW */
    const otpRecord = await OTP.findOne({ mobile, role: "user" });

    if (!otpRecord) {
      return handleResponse(res, 404, "OTP not found or expired");
    }

    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ mobile, role: "user" });
      return handleResponse(res, 400, "OTP expired");
    }

    const isMatch = await verifyHashedOTP(otp, otpRecord.otp);

    if (!isMatch) {
      return handleResponse(res, 400, "Invalid OTP");
    }

    let user = await User.findOne({ mobile });

    if (!user) {
      return handleResponse(res, 404, "User not found");
    }

    user.isVerified = true;
    await user.save();

    // Delete OTP record after successful verification
    await OTP.deleteOne({ mobile, role: "user" });

    const token = jwt.sign(
      { id: user._id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return handleResponse(res, 200, "Login successful", {
      token,
      user: {
        id: user._id,
        mobile: user.mobile,
        fullName: user.fullName,
        legalEntityName: user.legalEntityName,
        email: user.email,
        profileImage: user.profileImage,
        role: "user",
        onboardingCompleted: user.onboardingCompleted || false,
        businessType: user.businessType || null,
      },
    });
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, "Internal server error");
  }
};



// export const verifyOTP = async (req, res) => {
//   try {
//     const { mobile, otp } = req.body;

//     // Validation
//     if (!mobile || !otp) {
//       return handleResponse(res, 400, "Mobile & OTP are required");
//     }

//     if (!/^\d{6}$/.test(otp)) {
//       return handleResponse(res, 400, "OTP must be 6 digits");
//     }

//     const user = await User.findOne({ mobile });

//     if (!user) {
//       return handleResponse(res, 404, "User not found");
//     }

//     // OTP expired
//     if (user.otpExpiresAt < new Date()) {
//       return handleResponse(res, 400, "OTP expired");
//     }

//     // Too many attempts
//     if (user.otpAttempts >= 5) {
//       return handleResponse(
//         res,
//         429,
//         "Too many invalid attempts, request new OTP"
//       );
//     }

//     // OTP mismatch
//     if (user.otp !== otp) {
//       user.otpAttempts += 1;
//       await user.save();
//       return handleResponse(res, 400, "Invalid OTP");
//     }

//     // Success
//     user.isVerified = true;
//     user.otp = null;
//     user.otpExpiresAt = null;
//     user.otpAttempts = 0;

//     await user.save();

//     return handleResponse(res, 200, "Login successful", {
//       id: user._id,
//       mobile: user.mobile,
//     });
//   } catch (error) {
//     console.error(error);
//     return handleResponse(res, 500, "Internal server error");
//   }
// };
export const getMe = async (req, res) => {
  try {
    return handleResponse(res, 200, "User profile", req.user);
  } catch (error) {
    return handleResponse(res, 500, "Server error");
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile)
      return handleResponse(res, 400, "Mobile required");

    const user = await User.findOne({ mobile });
    if (!user)
      return handleResponse(res, 404, "User not found");

    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);

    await OTP.findOneAndUpdate(
      { mobile, role: "user" },
      {
        otp: hashedOtp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        verified: false
      },
      { upsert: true }
    );

    await sendSMS(mobile, otp);

    return handleResponse(res, 200, "OTP sent for password reset");
  } catch (error) {
    return handleResponse(res, 500, "Server error");
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { mobile, otp, newPassword } = req.body;

    if (!mobile || !otp || !newPassword)
      return handleResponse(res, 400, "All fields required");

    const user = await User.findOne({ mobile });
    if (!user)
      return handleResponse(res, 404, "User not found");

    const otpRecord = await OTP.findOne({ mobile, role: "user" });
    if (!otpRecord)
      return handleResponse(res, 400, "OTP not found or expired");

    const isMatch = await verifyHashedOTP(otp, otpRecord.otp);
    if (!isMatch)
      return handleResponse(res, 400, "Invalid OTP");

    if (otpRecord.expiresAt < new Date())
      return handleResponse(res, 400, "OTP expired");

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await OTP.deleteOne({ mobile, role: "user" });

    return handleResponse(res, 200, "Password reset successful");
  } catch (error) {
    return handleResponse(res, 500, "Server error");
  }
};

/**
 * UPDATE PROFILE
 */
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      fullName,
      email,
      panNumber,
      legalEntityName,
      address,
      preferences,
      profileImage,
      businessType,
      gstNumber,
      fssaiNumber,
      onboardingCompleted,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return handleResponse(res, 404, "User not found");
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (email !== undefined) user.email = email;
    if (panNumber !== undefined) user.panNumber = panNumber;
    if (legalEntityName !== undefined) user.legalEntityName = legalEntityName;
    if (address !== undefined) user.address = address;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (businessType !== undefined) user.businessType = businessType;
    if (gstNumber !== undefined) user.gstNumber = gstNumber;
    if (fssaiNumber !== undefined) user.fssaiNumber = fssaiNumber;
    if (onboardingCompleted !== undefined) user.onboardingCompleted = onboardingCompleted;

    if (preferences) {
      user.preferences = {
        ...user.preferences.toObject(),
        ...preferences,
      };
    }

    await user.save();

    return handleResponse(res, 200, "Profile updated successfully", user);
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, "Internal server error");
  }
};

/**
 * CHANGE PASSWORD
 */
export const changeUserPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.password) {
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      return handleResponse(res, 200, "Password set successfully");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return handleResponse(res, 400, "Invalid old password");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return handleResponse(res, 200, "Password changed successfully");
  } catch (error) {
    return handleResponse(res, 500, "Server error");
  }
};

export const createWalletRechargeOrder = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id?.toString();
    if (!userId) return handleResponse(res, 401, "User not authenticated");
    const amount = Number(req.body.amount || 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      return handleResponse(res, 400, "Valid recharge amount is required");
    }

    if (amount > 100000) {
      return handleResponse(res, 400, "Recharge amount exceeds allowed limit");
    }

    const user = await User.findById(userId).select("_id");
    if (!user) return handleResponse(res, 404, "User not found");

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return handleResponse(res, 500, "Razorpay is not configured");
    }

    const shortUser = String(userId).slice(-6);
    const shortTs = Date.now().toString(36);
    const receipt = `wr_${shortUser}_${shortTs}`; // Razorpay receipt max length: 40

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt,
      notes: {
        type: "wallet_recharge",
        userId: userId.toString(),
      },
    });

    await WalletRecharge.findOneAndUpdate(
      { razorpayOrderId: order.id },
      {
        userId,
        amount: Number(amount.toFixed(2)),
        currency: "INR",
        status: "created",
        razorpayOrderId: order.id,
      },
      { upsert: true, new: true }
    );

    return handleResponse(res, 200, "Wallet recharge order created", {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    const reason =
      error?.error?.description ||
      error?.message ||
      "Unknown error";
    console.error("Create wallet recharge order error:", reason, error);
    return handleResponse(res, 500, `Failed to initialize wallet recharge: ${reason}`);
  }
};

export const verifyWalletRecharge = async (req, res) => {
  try {
    const userId = req.user.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return handleResponse(res, 400, "Missing payment credentials");
    }

    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return handleResponse(res, 400, "Invalid payment signature");
    }

    const recharge = await WalletRecharge.findOne({
      userId,
      razorpayOrderId: razorpay_order_id,
    });

    if (!recharge) {
      return handleResponse(res, 404, "Recharge order not found");
    }

    // Idempotency: do not credit wallet twice for same Razorpay order.
    if (recharge.status === "paid") {
      const existingUser = await User.findById(userId);
      return handleResponse(res, 200, "Wallet already recharged", existingUser);
    }

    const user = await User.findById(userId);
    if (!user) return handleResponse(res, 404, "User not found");

    user.walletBalance = Number((Number(user.walletBalance || 0) + Number(recharge.amount || 0)).toFixed(2));
    user.walletTransactions = user.walletTransactions || [];
    user.walletTransactions.unshift({
      txnId: `WAL-RZP-${Date.now()}`,
      type: "Added",
      amount: Number(recharge.amount || 0),
      status: "Success",
      note: "Wallet recharge via Razorpay",
      createdAt: new Date(),
    });

    recharge.status = "paid";
    recharge.razorpayPaymentId = razorpay_payment_id;
    recharge.paidAt = new Date();

    await recharge.save();
    await user.save();

    return handleResponse(res, 200, "Wallet recharged successfully", user);
  } catch (error) {
    console.error("Wallet recharge error:", error);
    return handleResponse(res, 500, "Server error");
  }
};

export const redeemLoyaltyPoints = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id?.toString();
    if (!userId) return handleResponse(res, 401, "User not authenticated");

    const requestedPoints = Number(req.body.points || 0);
    if (!Number.isFinite(requestedPoints) || requestedPoints <= 0) {
      return handleResponse(res, 400, "Valid points are required");
    }

    const loyaltySetting = await GlobalSetting.findOne({ key: "loyalty_config" });
    const cfg = loyaltySetting?.value || {};
    const redemptionRate = Math.max(1, Number(cfg.redemptionRate || 10)); // points per ₹1
    const minRedeemPoints = Math.max(1, Number(cfg.minRedeemPoints || 100));

    if (requestedPoints < minRedeemPoints) {
      return handleResponse(res, 400, `Minimum ${minRedeemPoints} points required to redeem`);
    }

    const user = await User.findById(userId);
    if (!user) return handleResponse(res, 404, "User not found");

    const currentPoints = Number(user.loyaltyPoints || 0);
    if (currentPoints < requestedPoints) {
      return handleResponse(res, 400, "Insufficient loyalty points");
    }

    const redeemRupees = Math.floor(requestedPoints / redemptionRate);
    if (redeemRupees <= 0) {
      return handleResponse(res, 400, "Redeem points are below conversion threshold");
    }

    const pointsConsumed = redeemRupees * redemptionRate;
    user.loyaltyPoints = Math.max(0, currentPoints - pointsConsumed);
    user.walletBalance = Number((Number(user.walletBalance || 0) + redeemRupees).toFixed(2));
    user.walletTransactions = user.walletTransactions || [];
    user.walletTransactions.unshift({
      txnId: `RED-${Date.now()}`,
      type: "Redemption",
      amount: redeemRupees,
      status: "Success",
      note: `Redeemed ${pointsConsumed} points to wallet`,
      createdAt: new Date(),
    });

    await user.save();
    return handleResponse(res, 200, "Loyalty points redeemed successfully", user);
  } catch (error) {
    console.error("Redeem loyalty points error:", error);
    return handleResponse(res, 500, "Server error");
  }
};

