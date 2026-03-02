import jwt from "jsonwebtoken";
import Vendor from "../models/vendor.js";
import handleResponse from "../utils/helper.js";

export const protectVendor = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log("No auth header provided");
      return handleResponse(res, 401, "Token required");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log("No token in auth header");
      return handleResponse(res, 401, "Token required");
    }

    console.log("Decoding token:", token.substring(0, 10) + "...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded ID:", decoded.id);

    const vendor = await Vendor.findById(decoded.id).select("-password");
    if (!vendor) {
      console.log("Vendor not found for ID:", decoded.id);
      return handleResponse(res, 401, "Unauthorized");
    }

    req.vendor = vendor;
    next();
  } catch (err) {
    console.error("JWT Verification error:", err.message);
    return handleResponse(res, 401, "Invalid token");
  }
};
