import Franchise from "../models/franchise.js";
import OTP from "../models/otp.js";
import { handleResponse } from "../utils/helper.js";
import { generateOTP, hashOTP, verifyHashedOTP } from "../utils/otpHelper.js";
import { sendSMS } from "../utils/smsService.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { latLngToCell, gridDisk } from "h3-js";

import { geocodeAddress } from "../utils/geo.js";

/* 🔐 TOKEN */
const generateToken = (id) =>
  jwt.sign({ id, role: "franchise" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

/* ================= REGISTER ================= */
export const registerFranchise = async (req, res) => {
  try {
    const {
      franchiseName,
      ownerName,
      mobile,
      city,
      area,
      state,
      location,
      servedCategories,
    } = req.body;

    if (!franchiseName || !ownerName || !mobile || !city || !state) {
      return handleResponse(res, 400, "All fields are required");
    }

    if (servedCategories && !Array.isArray(servedCategories)) {
      return handleResponse(
        res,
        400,
        "servedCategories must be an array of category IDs",
      );
    }

    if (!/^[A-Za-z\s]+$/.test(state)) {
      return handleResponse(
        res,
        400,
        "State must contain only letters and spaces",
      );
    }

    if (!/^[6-9]\d{9}$/.test(mobile))
      return handleResponse(res, 400, "Invalid mobile number");

    let franchise = await Franchise.findOne({ mobile });

    if (franchise && franchise.isVerified)
      return handleResponse(res, 409, "Franchise already registered");

    if (!franchise) {
      let coords = [0, 0];
      let initialHexagons = [];

      // If coordinates provided, use them
      if (location && location.lat && location.lng) {
        coords = [location.lng, location.lat];
      }
      // Fallback to geocoding the address
      else {
        const query = `${area ? area + ", " : ""}${city}, ${state}, India`;
        const geocoded = await geocodeAddress(query);
        if (geocoded) {
          coords = [geocoded.lng, geocoded.lat];
        }
      }

      if (coords[0] !== 0 || coords[1] !== 0) {
        // Get center hexagon at resolution 8 (~0.73 km2 area)
        const centerHex = latLngToCell(coords[1], coords[0], 8);
        // Get 1 ring (center + 6 neighbors = 7 hexagons)
        initialHexagons = gridDisk(centerHex, 1);
      }

      franchise = await Franchise.create({
        franchiseName,
        ownerName,
        mobile,
        city,
        area,
        state,
        location: {
          type: "Point",
          coordinates: coords,
        },
        servedCategories: servedCategories || [],
        serviceHexagons: initialHexagons,
      });
    }

    const devPhone = process.env.FRANCHISE_DEFAULT_PHONE?.trim();
    // Check if an OTP was recently sent (cooldown)
    const existingOTP = await OTP.findOne({ mobile, role: "franchise" });
    if (existingOTP && mobile !== devPhone) {
      const timeDiff = (new Date() - existingOTP.updatedAt) / 1000;
      if (timeDiff < 15) {
        return handleResponse(
          res,
          429,
          "Wait 15 seconds before requesting another OTP",
        );
      }
    }

    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);

    await OTP.findOneAndUpdate(
      { mobile, role: "franchise" },
      {
        otp: hashedOtp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        verified: false,
      },
      { upsert: true, returnDocument: "after" },
    );

    const smsSent = await sendSMS(mobile, otp);

    if (!smsSent && mobile !== devPhone) {
      // Delete the OTP record if sending failed so they can retry immediately
      await OTP.deleteOne({ mobile, role: "franchise" });
      return handleResponse(
        res,
        500,
        "Failed to send SMS. Please try again later.",
      );
    }

    return handleResponse(res, 200, "OTP sent for registration via SMS");
  } catch (err) {
    console.error("Register Error:", err);
    return handleResponse(res, 500, "Server error: " + err.message);
  }
};

/* ================= SEND OTP (LOGIN) ================= */
export const sendFranchiseOTP = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) return handleResponse(res, 400, "Mobile number required");

    if (!/^[6-9]\d{9}$/.test(mobile))
      return handleResponse(res, 400, "Invalid mobile number");

    let franchise = await Franchise.findOne({ mobile });

    const devPhone = process.env.FRANCHISE_DEFAULT_PHONE?.trim();

    if (!franchise) {
      // ✅ Allow Auto-Register for DEV MODE Number
      if (mobile === devPhone) {
        franchise = await Franchise.create({
          mobile,
          franchiseName: "Dev Franchise",
          ownerName: "Dev Owner",
          city: "Dev City",
          isVerified: true,
          status: "active",
        });
      } else {
        return handleResponse(
          res,
          404,
          "Franchise not found. Please register first.",
        );
      }
    }

    if (franchise.status === "blocked")
      return handleResponse(res, 403, "Account blocked");

    // Check if an OTP was recently sent (cooldown)
    const existingOTP = await OTP.findOne({ mobile, role: "franchise" });
    if (existingOTP && mobile !== devPhone) {
      const timeDiff = (new Date() - existingOTP.updatedAt) / 1000;
      if (timeDiff < 15) {
        return handleResponse(
          res,
          429,
          "Wait 15 seconds before requesting another OTP",
        );
      }
    }

    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);

    await OTP.findOneAndUpdate(
      { mobile, role: "franchise" },
      {
        otp: hashedOtp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        verified: false,
      },
      { upsert: true, returnDocument: "after" },
    );

    const smsSent = await sendSMS(mobile, otp);

    if (!smsSent && mobile !== devPhone) {
      // Delete the OTP record if sending failed so they can retry immediately
      await OTP.deleteOne({ mobile, role: "franchise" });
      return handleResponse(
        res,
        500,
        "Failed to send SMS. Please try again later.",
      );
    }

    return handleResponse(res, 200, "OTP sent for login via SMS");
  } catch (err) {
    // Cleanup on error
    await OTP.deleteOne({ mobile: req.body.mobile, role: "franchise" });
    console.error(err);
    return handleResponse(res, 500, "Server error: " + err.message);
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
    const isDevMode =
      mobile === process.env.FRANCHISE_DEFAULT_PHONE?.trim() &&
      otp.toString() === process.env.FRANCHISE_DEFAULT_OTP?.trim();

    if (isDevMode) {
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

      // Invalidate any existing OTP
      await OTP.deleteOne({ mobile, role: "franchise" });

      console.log(`[Franchise Login] DEV MODE Success for ${mobile}`);
      return handleResponse(res, 200, "Login successful (DEV MODE)", {
        ...franchiseObj,
        token,
      });
    }

    /* 🔽 NORMAL OTP FLOW */
    const otpRecord = await OTP.findOne({ mobile, role: "franchise" });
    if (!otpRecord) return handleResponse(res, 404, "OTP not found or expired");

    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ mobile, role: "franchise" });
      return handleResponse(res, 400, "OTP expired");
    }

    const isMatch = await verifyHashedOTP(otp, otpRecord.otp);

    if (!isMatch) {
      return handleResponse(res, 400, "Invalid OTP");
    }

    const franchise = await Franchise.findOne({ mobile });
    if (!franchise) return handleResponse(res, 404, "Franchise not found");

    if (franchise.status === "blocked")
      return handleResponse(res, 403, "Account blocked");

    franchise.isVerified = true;

    if (franchise.status === "pending") {
      franchise.status = "active";
    }

    await franchise.save();

    // Delete OTP record after successful verification
    await OTP.deleteOne({ mobile, role: "franchise" });

    const token = generateToken(franchise._id);

    const franchiseObj = franchise.toObject();
    delete franchiseObj.password;
    delete franchiseObj.otp;

    console.log(
      `[Franchise Login] Success for ${mobile}, Token generated: ${token.substring(0, 10)}...`,
    );

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

    const { franchiseName, ownerName, mobile, city, area, state, location } =
      req.body;
    const franchiseId = req.franchise._id;

    const franchise = await Franchise.findById(franchiseId);
    if (!franchise) return handleResponse(res, 404, "Franchise not found");

    if (mobile && mobile !== franchise.mobile) {
      const existing = await Franchise.findOne({ mobile });
      if (existing)
        return handleResponse(res, 409, "Mobile number already in use");
      franchise.mobile = mobile;
    }

    if (franchiseName) franchise.franchiseName = franchiseName;
    if (ownerName) franchise.ownerName = ownerName;
    if (area) franchise.area = area;

    let addressChanged = false;
    if (city && city !== franchise.city) {
      franchise.city = city;
      addressChanged = true;
    }
    if (area && area !== franchise.area) {
      franchise.area = area;
      addressChanged = true;
    }
    if (state !== undefined && state !== "" && state !== franchise.state) {
      if (!/^[A-Za-z\s]+$/.test(state)) {
        return handleResponse(
          res,
          400,
          "State must contain only letters and spaces",
        );
      }
      franchise.state = state;
      addressChanged = true;
    }

    // Handle direct location update (e.g. from GPS)
    // Ensure values are valid numbers before assigning
    if (location && typeof location === "object") {
      const lat = Number(location.lat);
      const lng = Number(location.lng);

      if (!isNaN(lat) && !isNaN(lng)) {
        franchise.location = {
          type: "Point",
          coordinates: [lng, lat], // [longitude, latitude]
        };
        addressChanged = false; // GPS override takes priority
      }
    }

    // If address changed and no manual location provided, re-geocode
    if (addressChanged) {
      try {
        const query = `${franchise.area ? franchise.area + ", " : ""}${franchise.city}, ${franchise.state || ""}, India`;
        const coords = await geocodeAddress(query);
        if (coords) {
          franchise.location = {
            type: "Point",
            coordinates: [coords.lng, coords.lat],
          };

          // If they have NO hexagons, or if the city changed, give them a fresh center ring
          if (
            !franchise.serviceHexagons ||
            franchise.serviceHexagons.length === 0 ||
            city !== franchise.city
          ) {
            const centerHex = latLngToCell(coords.lat, coords.lng, 8);
            franchise.serviceHexagons = gridDisk(centerHex, 1);
          }

          console.log(
            `[Geocoding] Updated franchise ${franchiseId} location to ${coords.lat}, ${coords.lng}`,
          );
        }
      } catch (geoErr) {
        console.error(
          "Geocoding failed during profile update:",
          geoErr.message,
        );
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

    if (!newPassword)
      return handleResponse(res, 400, "New password is required");

    const franchise = await Franchise.findById(franchiseId).select("+password");
    if (!franchise) return handleResponse(res, 404, "Franchise not found");

    // If password exists, verify old password
    if (franchise.password) {
      if (!oldPassword)
        return handleResponse(res, 400, "Old password is required");
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
        status: "pending",
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

    return handleResponse(
      res,
      200,
      "Documents uploaded and franchise verified",
      franchise,
    );
  } catch (err) {
    console.error("Document upload error:", err);
    return handleResponse(res, 500, "Server error during document upload");
  }
};
