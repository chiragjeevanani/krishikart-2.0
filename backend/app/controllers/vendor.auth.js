import Vendor from "../models/vendor.js";
import handleResponse from "../utils/helper.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* 🔐 TOKEN */
const generateToken = (id) =>
    jwt.sign({ id, role: "vendor" }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

/* ================= REGISTER ================= */
export const registerVendor = async (req, res) => {
    try {
        const { fullName, email, mobile, farmLocation, password } = req.body;

        const exists = await Vendor.findOne({ email });
        if (exists)
            return handleResponse(res, 409, "Vendor already exists");

        const hashedPassword = await bcrypt.hash(password, 10);

        const vendor = await Vendor.create({
            fullName,
            email,
            mobile,
            farmLocation,
            password: hashedPassword,
        });

        return handleResponse(res, 201, "Vendor registered successfully", {
            id: vendor._id,
            email: vendor.email,
            status: vendor.status,
        });
    } catch (err) {
        console.error("Register Error:", err);
        return handleResponse(res, 500, "Server error: " + err.message);
    }
};

/* ================= LOGIN ================= */
export const loginVendor = async (req, res) => {
    try {
        const { email, password } = req.body;

        const vendor = await Vendor.findOne({ email });
        if (!vendor)
            return handleResponse(res, 404, "Vendor not found");

        if (vendor.status === "pending")
            return handleResponse(res, 403, "Account pending approval");

        if (vendor.status === "blocked")
            return handleResponse(res, 403, "Account blocked");

        const match = await bcrypt.compare(password, vendor.password);
        if (!match)
            return handleResponse(res, 400, "Invalid credentials");

        const token = generateToken(vendor._id);

        return handleResponse(res, 200, "Login successful", {
            token,
            id: vendor._id,
            email: vendor.email,
        });
    } catch (err) {
        return handleResponse(res, 500, "Server error");
    }
};

/* ================= GET ME ================= */
export const getVendorMe = async (req, res) => {
    return handleResponse(res, 200, "Vendor profile", req.vendor);
};
import crypto from "crypto";

/* ================= FORGOT PASSWORD ================= */
export const forgotVendorPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email)
            return handleResponse(res, 400, "Email is required");

        const vendor = await Vendor.findOne({ email });

        if (!vendor)
            return handleResponse(res, 404, "Vendor not found");

        if (vendor.status === "blocked")
            return handleResponse(res, 403, "Account blocked");

        // generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        vendor.resetPasswordToken = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

        vendor.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min

        await vendor.save();

        console.log("Vendor Reset OTP:", otp);

        // 📧 send email here
        // await sendEmail(vendor.email, otp);

        return handleResponse(res, 200, "Reset OTP sent to email", {
            otp, // ❌ remove in production, useful for testing
        });
    } catch (err) {
        console.error(err);
        return handleResponse(res, 500, "Server error");
    }
};
/* ================= RESET PASSWORD ================= */
export const resetVendorPassword = async (req, res) => {
    try {
        const { email, token, newPassword, confirmPassword } = req.body;

        if (!email || !token || !newPassword || !confirmPassword)
            return handleResponse(res, 400, "All fields required (including email)");

        if (newPassword !== confirmPassword)
            return handleResponse(res, 400, "Passwords do not match");

        if (newPassword.length < 8)
            return handleResponse(res, 400, "Password must be at least 8 characters");

        const vendor = await Vendor.findOne({ email });

        if (!vendor) return handleResponse(res, 404, "Vendor not found");

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        console.log("Input Token:", token);
        console.log("Input Hash:", hashedToken);
        console.log("Stored Hash:", vendor.resetPasswordToken);
        console.log("Expiry:", vendor.resetPasswordExpires);
        console.log("Now:", new Date());

        if (vendor.resetPasswordToken !== hashedToken)
            return handleResponse(res, 400, "Invalid OTP");

        if (vendor.resetPasswordExpires < Date.now())
            return handleResponse(res, 400, "OTP expired");

        vendor.password = await bcrypt.hash(newPassword, 10);
        vendor.resetPasswordToken = null;
        vendor.resetPasswordExpires = null;

        await vendor.save();

        return handleResponse(res, 200, "Password reset successful");
    } catch (err) {
        console.error(err);
        return handleResponse(res, 500, "Server error");
    }
};
