import Franchise from "../models/franchise.js";
import OTP from "../models/otp.js";
import Category from "../models/category.js";
import { handleResponse } from "../utils/helper.js";
import {
  generateOTP,
  hashOTP,
  verifyHashedOTP,
  matchesGlobalDefaultOtp,
  isGlobalDefaultOtpEnabled,
} from "../utils/otpHelper.js";
import { sendSMS } from "../utils/smsService.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { latLngToCell, gridDisk } from "h3-js";

import { geocodeAddress } from "../utils/geo.js";
import {
  isValidFssaiNumber,
  normalizeFssaiNumber,
  isValidFranchiseGst14,
  normalizeFranchiseGst14,
} from "../utils/gstFranchiseKyc.js";

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
      formattedAddress,
      servedCategories,
      fssaiNumber,
      gstNumber,
    } = req.body;

    if (!franchiseName || !ownerName || !mobile || !city || !state) {
      return handleResponse(res, 400, "All fields are required");
    }

    if (!fssaiNumber) {
      return handleResponse(res, 400, "FSSAI number is required");
    }
    if (!isValidFssaiNumber(fssaiNumber)) {
      return handleResponse(res, 400, "Invalid FSSAI number (must be 14 digits)");
    }

    if (!gstNumber) {
      return handleResponse(res, 400, "GST number is required");
    }
    if (!isValidFranchiseGst14(gstNumber)) {
      return handleResponse(res, 400, "Invalid GST number format");
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

    // Validate coordinates if provided
    if (location && location.lat && location.lng) {
      const lat = Number(location.lat);
      const lng = Number(location.lng);

      if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
        return handleResponse(res, 400, 'Coordinates must be valid numbers');
      }

      if (lat < -90 || lat > 90) {
        return handleResponse(res, 400, 'Latitude must be between -90 and 90 degrees');
      }

      if (lng < -180 || lng > 180) {
        return handleResponse(res, 400, 'Longitude must be between -180 and 180 degrees');
      }
    }

    let franchise = await Franchise.findOne({ mobile });

    if (franchise && franchise.isVerified)
      return handleResponse(res, 409, "Franchise already registered");

    if (!franchise) {
      let coords = [0, 0];
      let initialHexagons = [];

      // Priority: use provided coordinates > geocode text address > default [0,0]
      if (location && location.lat && location.lng) {
        coords = [location.lng, location.lat]; // GeoJSON format: [longitude, latitude]
      }
      // Fallback to geocoding the address
      else if (city && state) {
        try {
          const query = `${area ? area + ", " : ""}${city}, ${state}, India`;
          const geocoded = await geocodeAddress(query);
          if (geocoded) {
            coords = [geocoded.lng, geocoded.lat];
          } else {
            console.warn(`Geocoding failed for ${query}`);
          }
        } catch (geoErr) {
          console.error('Geocoding error:', geoErr.message);
          // Non-fatal: continue with [0, 0]
        }
      }

      // Calculate H3 hexagons only for non-zero coordinates
      if (coords[0] !== 0 || coords[1] !== 0) {
        try {
          // Get center hexagon at resolution 8 (~0.73 km2 area)
          const centerHex = latLngToCell(coords[1], coords[0], 8);
          // Get 1 ring (center + 6 neighbors = 7 hexagons)
          initialHexagons = gridDisk(centerHex, 1);
        } catch (h3Error) {
          console.error('H3 calculation error:', h3Error.message);
          // Non-fatal: continue without hexagons
        }
      }

      franchise = await Franchise.create({
        franchiseName,
        ownerName,
        mobile,
        city,
        area,
        state,
        formattedAddress: formattedAddress || null,
        location: {
          type: "Point",
          coordinates: coords,
        },
        servedCategories: servedCategories || [],
        serviceHexagons: initialHexagons,
        isVerified: false,
        status: "pending",
        kyc: {
          fssaiNumber: normalizeFssaiNumber(fssaiNumber),
          gstNumber: normalizeFranchiseGst14(gstNumber),
        },
      });
    }

    if (isGlobalDefaultOtpEnabled()) {
      return handleResponse(
        res,
        200,
        "Default OTP mode: SMS not sent. Use DEFAULT_OTP to verify registration.",
      );
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
          isVerified: false,
          status: "pending",
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

    if (isGlobalDefaultOtpEnabled()) {
      return handleResponse(
        res,
        200,
        "Default OTP mode: SMS not sent. Use DEFAULT_OTP to log in.",
      );
    }

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
          isVerified: false,
          status: "pending",
        });
      }

      const token = generateToken(franchise._id);
      const hydrated = await Franchise.findById(franchise._id).populate(
        "servedCategories",
      );
      const franchiseObj = hydrated?.toObject?.() || franchise.toObject();

      // Invalidate any existing OTP
      await OTP.deleteOne({ mobile, role: "franchise" });

      console.log(`[Franchise Login] DEV MODE Success for ${mobile}`);
      return handleResponse(res, 200, "Login successful (DEV MODE)", {
        ...franchiseObj,
        token,
      });
    }

    /* ✅ GLOBAL DEFAULT OTP — any valid 10-digit mobile + DEFAULT_OTP */
    if (matchesGlobalDefaultOtp(otp)) {
      if (!/^[6-9]\d{9}$/.test(mobile)) {
        return handleResponse(res, 400, "Invalid mobile number");
      }
      let franchise = await Franchise.findOne({ mobile });

      if (!franchise) {
        franchise = await Franchise.create({
          mobile,
          franchiseName: "Dev Franchise",
          ownerName: "Dev Owner",
          city: "Dev City",
          isVerified: false,
          status: "pending",
        });
      }

      if (franchise.status === "blocked")
        return handleResponse(res, 403, "Account blocked");

      const token = generateToken(franchise._id);
      const hydrated = await Franchise.findById(franchise._id).populate(
        "servedCategories",
      );
      const franchiseObj = hydrated?.toObject?.() || franchise.toObject();

      await OTP.deleteOne({ mobile, role: "franchise" });

      console.log(`[Franchise Login] Default OTP mode success for ${mobile}`);
      return handleResponse(res, 200, "Login successful (default OTP mode)", {
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

    // Phone OTP proves identity only; `isVerified` is set by master admin after KYC approval.

    // Delete OTP record after successful verification
    await OTP.deleteOne({ mobile, role: "franchise" });

    const token = generateToken(franchise._id);
    const hydrated = await Franchise.findById(franchise._id).populate(
      "servedCategories",
    );
    const franchiseObj = hydrated?.toObject?.() || franchise.toObject();
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
  const franchise = await Franchise.findById(req.franchise._id).populate("servedCategories");
  return handleResponse(res, 200, "Franchise profile", franchise);
};

/* ================= UPDATE PROFILE ================= */
export const updateFranchiseProfile = async (req, res) => {
  try {
    console.log("Updating franchise profile for:", req.franchise._id);
    console.log("Request body:", req.body);

    const { franchiseName, ownerName, mobile, city, area, state, location, formattedAddress, servedCategories } =
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
    if (servedCategories !== undefined) {
      if (!Array.isArray(servedCategories)) {
        return handleResponse(res, 400, "servedCategories must be an array");
      }

      // Normalize + validate category IDs so one franchise cannot "poison" the catalog selection.
      const normalized = [...new Set(servedCategories.filter(Boolean).map(String))];
      const invalid = normalized.filter((id) => !/^[a-fA-F0-9]{24}$/.test(id));
      if (invalid.length) {
        return handleResponse(res, 400, "servedCategories contains invalid category IDs", {
          invalid,
        });
      }

      if (normalized.length > 0) {
        const existing = await Category.countDocuments({ _id: { $in: normalized } });
        if (existing !== normalized.length) {
          return handleResponse(res, 400, "servedCategories contains unknown categories");
        }
      }

      franchise.servedCategories = normalized;
    }

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

    // Handle direct location update (e.g. from GPS or map picker)
    if (location && typeof location === "object") {
      const lat = Number(location.lat);
      const lng = Number(location.lng);

      // Validate coordinates
      if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
        return handleResponse(res, 400, 'Coordinates must be valid numbers');
      }

      if (lat < -90 || lat > 90) {
        return handleResponse(res, 400, 'Latitude must be between -90 and 90 degrees');
      }

      if (lng < -180 || lng > 180) {
        return handleResponse(res, 400, 'Longitude must be between -180 and 180 degrees');
      }

      if (!isNaN(lat) && !isNaN(lng)) {
        franchise.location = {
          type: "Point",
          coordinates: [lng, lat], // [longitude, latitude]
        };

        // Update formatted address if provided
        if (formattedAddress) {
          franchise.formattedAddress = formattedAddress;
        }

        // Recalculate H3 hexagons for new location
        try {
          const centerHex = latLngToCell(lat, lng, 8);
          franchise.serviceHexagons = gridDisk(centerHex, 1);
        } catch (h3Error) {
          console.error('H3 calculation error during profile update:', h3Error.message);
          // Non-fatal: continue without updating hexagons
        }

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
            try {
              const centerHex = latLngToCell(coords.lat, coords.lng, 8);
              franchise.serviceHexagons = gridDisk(centerHex, 1);
            } catch (h3Error) {
              console.error('H3 calculation error:', h3Error.message);
            }
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

    const hydrated = await Franchise.findById(franchiseId).populate(
      "servedCategories",
    );
    return handleResponse(res, 200, "Profile updated successfully", hydrated);
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

    if (!Array.isArray(franchise.documents)) franchise.documents = [];
    franchise.documents.push(...uploadedDocs);

    await franchise.save();

    return handleResponse(
      res,
      200,
      "Documents uploaded; pending admin verification",
      franchise,
    );
  } catch (err) {
    console.error("Document upload error:", err);
    return handleResponse(res, 500, "Server error during document upload");
  }
};
