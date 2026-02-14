import Vendor from "../models/vendor.js";
import handleResponse from "../utils/helper.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import crypto from "crypto";

/* 🔐 TOKEN */
const generateToken = (id) =>
    jwt.sign({ id, role: "vendor" }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

/* ================= REGISTER ================= */
/* ================= REGISTER ================= */

export const registerVendor = async (req, res) => {
    try {
        const { fullName, email, mobile, farmLocation, password, fssaiLicense } = req.body;

        // Parse nested bank details if present
        let bankDetails = {};
        if (req.body.bankDetails) {
            try {
                bankDetails = typeof req.body.bankDetails === 'string'
                    ? JSON.parse(req.body.bankDetails)
                    : req.body.bankDetails;
            } catch (e) {
                // If it's not JSON string, assume standard object if keys are flat.
                // Or maybe the frontend sends individual fields like bankAccountNo etc.
                // Let's rely on JSON string for simpler handling of nested obj in FormData
                console.error("Bank Details parsing error", e);
            }
        } else {
            // Try flat structure if user sent individual fields
            bankDetails = {
                accountHolderName: req.body['bankDetails[accountHolderName]'] || req.body.accountHolderName,
                accountNumber: req.body['bankDetails[accountNumber]'] || req.body.accountNumber,
                ifscCode: req.body['bankDetails[ifscCode]'] || req.body.ifscCode,
                bankName: req.body['bankDetails[bankName]'] || req.body.bankName
            };
        }

        const exists = await Vendor.findOne({ email });
        if (exists)
            return handleResponse(res, 409, "Vendor already exists");

        // Handle File Uploads
        let profilePictureUrl = "";
        let aadharCardUrl = "";
        let panCardUrl = "";
        let shopProofUrl = "";

        if (req.files) {
            if (req.files.profilePicture) {
                profilePictureUrl = await uploadToCloudinary(req.files.profilePicture[0].buffer, "vendors/profiles");
            }
            if (req.files.aadharFile) {
                aadharCardUrl = await uploadToCloudinary(req.files.aadharFile[0].buffer, "vendors/aadhar");
            }
            if (req.files.panFile) {
                panCardUrl = await uploadToCloudinary(req.files.panFile[0].buffer, "vendors/pan");
            }
            if (req.files.shopProofFile) {
                shopProofUrl = await uploadToCloudinary(req.files.shopProofFile[0].buffer, "vendors/shop_proof");
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const vendor = await Vendor.create({
            fullName,
            email,
            mobile,
            farmLocation,
            password: hashedPassword,
            profilePicture: profilePictureUrl,
            fssaiLicense,
            bankDetails,
            aadharCard: aadharCardUrl,
            panCard: panCardUrl,
            shopEstablishmentProof: shopProofUrl
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

/* ================= UPDATE VENDOR ================= */
export const updateVendorProfile = async (req, res) => {
    try {
        const { fullName, mobile, farmLocation, fssaiLicense } = req.body;

        const vendor = await Vendor.findById(req.vendor.id);
        if (!vendor) return handleResponse(res, 404, "Vendor not found");

        if (fullName) vendor.fullName = fullName;
        if (mobile) vendor.mobile = mobile;
        if (farmLocation) vendor.farmLocation = farmLocation;
        if (fssaiLicense) vendor.fssaiLicense = fssaiLicense;

        if (req.body.bankDetails) {
            let bankDetails = {};
            try {
                bankDetails = typeof req.body.bankDetails === 'string'
                    ? JSON.parse(req.body.bankDetails)
                    : req.body.bankDetails;

                vendor.bankDetails = { ...vendor.bankDetails, ...bankDetails };
            } catch (e) {
                console.error("Bank Details parsing error", e);
            }
        }

        if (req.files) {
            if (req.files.profilePicture) {
                vendor.profilePicture = await uploadToCloudinary(req.files.profilePicture[0].buffer, "vendors/profiles");
            }
            if (req.files.aadharFile) {
                vendor.aadharCard = await uploadToCloudinary(req.files.aadharFile[0].buffer, "vendors/aadhar");
            }
            if (req.files.panFile) {
                vendor.panCard = await uploadToCloudinary(req.files.panFile[0].buffer, "vendors/pan");
            }
            if (req.files.shopProofFile) {
                vendor.shopEstablishmentProof = await uploadToCloudinary(req.files.shopProofFile[0].buffer, "vendors/shop_proof");
            }
        }

        await vendor.save();

        return handleResponse(res, 200, "Profile updated successfully", vendor);

    } catch (err) {
        console.error("Update Error:", err);
        return handleResponse(res, 500, "Server error: " + err.message);
    }
};

/* ================= CHANGE PASSWORD ================= */
export const changeVendorPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword)
            return handleResponse(res, 400, "All fields are required");

        if (newPassword !== confirmPassword)
            return handleResponse(res, 400, "New passwords do not match");

        const vendor = await Vendor.findById(req.vendor.id);
        if (!vendor) return handleResponse(res, 404, "Vendor not found");

        const isMatch = await bcrypt.compare(currentPassword, vendor.password);
        if (!isMatch) return handleResponse(res, 400, "Incorrect current password");

        vendor.password = await bcrypt.hash(newPassword, 10);
        await vendor.save();

        return handleResponse(res, 200, "Password changed successfully");

    } catch (err) {
        console.error("Change Password Error:", err);
        return handleResponse(res, 500, "Server error");
    }
};


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
