import Franchise from "../models/franchise.js";
import handleResponse from "../utils/helper.js";
import jwt from "jsonwebtoken";

/* 🔐 TOKEN */
const generateToken = (id) =>
    jwt.sign({ id, role: "franchise" }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

/* ================= REGISTER ================= */
export const registerFranchise = async (req, res) => {
    try {
        const { franchiseName, ownerName, mobile, city } = req.body;

        let franchise = await Franchise.findOne({ mobile });

        if (franchise && franchise.isVerified)
            return handleResponse(res, 409, "Franchise already registered");

        if (!franchise) {
            franchise = await Franchise.create({
                franchiseName,
                ownerName,
                mobile,
                city,
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        franchise.otp = otp;
        franchise.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
        franchise.otpAttempts = 0;

        await franchise.save();

        console.log("Franchise Register OTP:", otp);

        return handleResponse(res, 200, "OTP sent for registration");
    } catch (err) {
        return handleResponse(res, 500, "Server error");
    }
};

/* ================= SEND OTP (LOGIN) ================= */
export const sendFranchiseOTP = async (req, res) => {
    try {
        const { mobile } = req.body;

        if (!mobile) return handleResponse(res, 400, "Mobile number required");

        const franchise = await Franchise.findOne({ mobile });

        if (!franchise) return handleResponse(res, 404, "Franchise not found");

        if (franchise.status === "blocked")
            return handleResponse(res, 403, "Account blocked");

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        franchise.otp = otp;
        franchise.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min
        franchise.otpAttempts = 0;

        await franchise.save();

        console.log("Franchise Login OTP:", otp);

        return handleResponse(res, 200, "OTP sent for login");
    } catch (err) {
        console.error(err);
        return handleResponse(res, 500, "Server error");
    }
};

/* ================= VERIFY FRANCHISE OTP ================= */
export const verifyFranchiseOTP = async (req, res) => {
    try {
        const { mobile, otp } = req.body;

        if (!mobile || !otp) {
            return handleResponse(res, 400, "Mobile & OTP are required");
        }

        /* ✅ DEV MODE DEFAULT LOGIN */
        if (
            mobile === process.env.FRANCHISE_DEFAULT_PHONE &&
            otp === process.env.FRANCHISE_DEFAULT_OTP
        ) {
            let franchise = await Franchise.findOne({ mobile });

            if (!franchise) {
                franchise = await Franchise.create({
                    mobile,
                    isVerified: true,
                    status: "active",
                });
            }

            const token = generateToken(franchise._id);

            return handleResponse(res, 200, "Login successful (DEV MODE)", {
                token,
                id: franchise._id,
                mobile: franchise.mobile,
                role: "franchise",
            });
        }

        /* 🔽 NORMAL OTP FLOW */
        const franchise = await Franchise.findOne({ mobile });
        if (!franchise)
            return handleResponse(res, 404, "Franchise not found");

        if (franchise.status === "blocked")
            return handleResponse(res, 403, "Account blocked");

        if (franchise.otpExpiresAt < new Date())
            return handleResponse(res, 400, "OTP expired");

        if (franchise.otpAttempts >= 5)
            return handleResponse(res, 429, "Too many attempts");

        if (franchise.otp !== otp) {
            franchise.otpAttempts += 1;
            await franchise.save();
            return handleResponse(res, 400, "Invalid OTP");
        }

        franchise.isVerified = true;
        franchise.otp = null;
        franchise.otpExpiresAt = null;
        franchise.otpAttempts = 0;

        if (franchise.status === "pending") {
            franchise.status = "active"; // or keep pending for admin approval
        }

        await franchise.save();

        const token = generateToken(franchise._id);

        return handleResponse(res, 200, "Login successful", {
            token,
            id: franchise._id,
            mobile: franchise.mobile,
            role: "franchise",
        });
    } catch (err) {
        console.error(err);
        return handleResponse(res, 500, "Server error");
    }
};

/* ================= GET ME ================= */
export const getFranchiseMe = async (req, res) => {
    return handleResponse(res, 200, "Franchise profile", req.franchise);
};
