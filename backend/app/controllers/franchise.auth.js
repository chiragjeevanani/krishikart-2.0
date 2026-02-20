import Franchise from "../models/franchise.js";
import handleResponse from "../utils/helper.js";
import { geocodeAddress } from "../utils/geo.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

/* 🔐 TOKEN */
const generateToken = (id) =>
    jwt.sign({ id, role: "franchise" }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

/* ================= REGISTER ================= */
export const registerFranchise = async (req, res) => {
    try {
        const { franchiseName, ownerName, mobile, city, area, state } = req.body;

        let franchise = await Franchise.findOne({ mobile });

        if (franchise && franchise.isVerified)
            return handleResponse(res, 409, "Franchise already registered");

        if (!franchise) {
            // Geocode the city to get lat/lng
            const coords = await geocodeAddress(city);

            franchise = await Franchise.create({
                franchiseName,
                ownerName,
                mobile,
                city,
                area,
                state,
                location: coords || { lat: null, lng: null }
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

        if (!franchise) {
            // ✅ Allow Auto-Register for DEV MODE Number
            if (mobile === process.env.FRANCHISE_DEFAULT_PHONE) {
                franchise = await Franchise.create({
                    mobile,
                    franchiseName: "Dev Franchise",
                    ownerName: "Dev Owner",
                    city: "Dev City",
                    isVerified: true,
                    status: "active",
                });
            } else {
                return handleResponse(res, 404, "Franchise not found");
            }
        }

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
                    franchiseName: "Dev Franchise",
                    ownerName: "Dev Owner",
                    city: "Dev City",
                    isVerified: true,
                    status: "active",
                });
            }

            const token = generateToken(franchise._id);

            const franchiseObj = franchise.toObject();
            delete franchiseObj.password;

            return handleResponse(res, 200, "Login successful (DEV MODE)", {
                ...franchiseObj,
                token
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

        const franchiseObj = franchise.toObject();
        delete franchiseObj.password;
        delete franchiseObj.otp;

        return handleResponse(res, 200, "Login successful", {
            ...franchiseObj,
            token,
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

/* ================= UPDATE PROFILE ================= */
export const updateFranchiseProfile = async (req, res) => {
    try {
        console.log("Updating franchise profile for:", req.franchise._id);
        console.log("Request body:", req.body);

        const { franchiseName, ownerName, mobile, city, area, state, location } = req.body;
        const franchiseId = req.franchise._id;

        const franchise = await Franchise.findById(franchiseId);
        if (!franchise) return handleResponse(res, 404, "Franchise not found");

        if (mobile && mobile !== franchise.mobile) {
            const existing = await Franchise.findOne({ mobile });
            if (existing) return handleResponse(res, 409, "Mobile number already in use");
            franchise.mobile = mobile;
        }

        if (franchiseName) franchise.franchiseName = franchiseName;
        if (ownerName) franchise.ownerName = ownerName;
        if (area) franchise.area = area;
        if (state) franchise.state = state;

        // Handle direct location update (e.g. from GPS)
        // Ensure values are valid numbers before assigning
        if (location && typeof location === 'object') {
            const lat = Number(location.lat);
            const lng = Number(location.lng);

            if (!isNaN(lat) && !isNaN(lng)) {
                franchise.location = { lat, lng };
            }
        }

        if (city && city !== franchise.city) {
            franchise.city = city;
            // Re-geocode if city changed and no direct location was provided in this update
            if (!location) {
                try {
                    const coords = await geocodeAddress(city);
                    if (coords) franchise.location = coords;
                } catch (geoErr) {
                    console.warn("Geocoding failed:", geoErr);
                }
            }
        }

        await franchise.save();

        console.log("Franchise updated successfully");
        return handleResponse(res, 200, "Profile updated successfully", franchise);
    } catch (err) {
        console.error("Update Profile Critical Error:", err);
        // Respond with the actual error message for debugging
        return handleResponse(res, 500, `Update Failed: ${err.message}`);
    }
};

/* ================= CHANGE PASSWORD ================= */
export const changeFranchisePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const franchiseId = req.franchise._id;

        if (!newPassword) return handleResponse(res, 400, "New password is required");

        const franchise = await Franchise.findById(franchiseId).select("+password");
        if (!franchise) return handleResponse(res, 404, "Franchise not found");

        // If password exists, verify old password
        if (franchise.password) {
            if (!oldPassword) return handleResponse(res, 400, "Old password is required");
            const isMatch = await bcrypt.compare(oldPassword, franchise.password);
            if (!isMatch) return handleResponse(res, 401, "Incorrect old password");
        }

        const salt = await bcrypt.genSalt(10);
        franchise.password = await bcrypt.hash(newPassword, salt);

        await franchise.save();

        return handleResponse(res, 200, "Password updated successfully");
    } catch (err) {
        console.error(err);
        return handleResponse(res, 500, "Server error");
    }
};

/* ================= UPLOAD DOCUMENTS ================= */
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const uploadFranchiseDocuments = async (req, res) => {
    try {
        const franchiseId = req.franchise._id;
        const franchise = await Franchise.findById(franchiseId);

        if (!franchise) return handleResponse(res, 404, "Franchise not found");

        if (!req.files || req.files.length === 0) {
            return handleResponse(res, 400, "No documents uploaded");
        }

        const uploadPromises = req.files.map(async (file) => {
            const url = await uploadToCloudinary(file.buffer, "franchise/documents");
            return {
                name: file.originalname,
                url: url,
                status: "pending"
            };
        });

        const uploadedDocs = await Promise.all(uploadPromises);

        franchise.documents.push(...uploadedDocs);

        // After documents are uploaded, we can mark as verified for now or leave for admin
        // User said: "is verified franchise tab hogi jab vo api document daal de"
        // So let's mark it as verified once they upload any document, or at least change status.
        // Let's set isVerified to true for now since the user prompt implies this trigger.
        franchise.isVerified = true;
        franchise.status = "active";

        await franchise.save();

        return handleResponse(res, 200, "Documents uploaded and franchise verified", franchise);
    } catch (err) {
        console.error("Document upload error:", err);
        return handleResponse(res, 500, "Server error during document upload");
    }
};
