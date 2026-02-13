import MasterAdmin from "../models/masteradmin.js";
import handleResponse from "../utils/helper.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* 🔐 JWT */
const generateToken = (id) =>
  jwt.sign(
    { id, role: "masteradmin" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  export const createMasterAdmin = async (req, res) => {
  try {
    const { email, password, secretKey } = req.body;

    /* 🔐 SECURITY CHECK */
    if (secretKey !== process.env.MASTERADMIN_SECRET) {
      return handleResponse(res, 403, "Unauthorized");
    }

    /* ❌ ALLOW ONLY ONE */
    const alreadyExists = await MasterAdmin.findOne({});
    if (alreadyExists) {
      return handleResponse(res, 400, "MasterAdmin already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await MasterAdmin.create({
      email,
      password: hashedPassword,
      role: "masteradmin",
      status: "active",
    });

    return handleResponse(res, 201, "MasterAdmin created", {
      id: admin._id,
      email: admin.email,
    });
  } catch (err) {
    console.error(err);
    return handleResponse(res, 500, "Server error");
  }
};

/* ================= LOGIN ================= */
export const loginMasterAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return handleResponse(res, 400, "Email & password required");

    const admin = await MasterAdmin.findOne({ email });
    if (!admin)
      return handleResponse(res, 404, "MasterAdmin not found");

    if (admin.status === "blocked")
      return handleResponse(res, 403, "Account blocked");

    const match = await bcrypt.compare(password, admin.password);
    if (!match)
      return handleResponse(res, 400, "Invalid credentials");

    const token = generateToken(admin._id);

    return handleResponse(res, 200, "Login successful", {
      token,
      id: admin._id,
      email: admin.email,
    });
  } catch (err) {
    return handleResponse(res, 500, "Server error");
  }
};

/* ================= GET ME ================= */
export const getMasterAdminMe = async (req, res) => {
  return handleResponse(res, 200, "MasterAdmin profile", req.masteradmin);
};

/* ================= FORGOT PASSWORD ================= */
export const forgotMasterAdminPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return handleResponse(res, 400, "Email required");

    const admin = await MasterAdmin.findOne({ email });
    if (!admin)
      return handleResponse(res, 404, "MasterAdmin not found");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    admin.otp = otp;
    admin.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await admin.save();

    console.log("MasterAdmin Reset OTP:", otp);
    // 📧 Email service integrate here

    return handleResponse(res, 200, "OTP sent to email");
  } catch (err) {
    return handleResponse(res, 500, "Server error");
  }
};

/* ================= RESET PASSWORD ================= */
export const resetMasterAdminPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword)
      return handleResponse(res, 400, "All fields required");

    const admin = await MasterAdmin.findOne({ email });
    if (!admin)
      return handleResponse(res, 404, "MasterAdmin not found");

    if (admin.otp !== otp)
      return handleResponse(res, 400, "Invalid OTP");

    if (admin.otpExpiresAt < new Date())
      return handleResponse(res, 400, "OTP expired");

    admin.password = await bcrypt.hash(newPassword, 10);
    admin.otp = null;
    admin.otpExpiresAt = null;

    await admin.save();

    return handleResponse(res, 200, "Password reset successful");
  } catch (err) {
    return handleResponse(res, 500, "Server error");
  }
};
