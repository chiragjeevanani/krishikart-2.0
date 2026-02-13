import jwt from "jsonwebtoken";
import Vendor from "../models/vendor.js";
import handleResponse from "../utils/helper.js";

export const protectVendor = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return handleResponse(res, 401, "Token required");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const vendor = await Vendor.findById(decoded.id).select("-password");
    if (!vendor)
      return handleResponse(res, 401, "Unauthorized");

    req.vendor = vendor;
    next();
  } catch (err) {
    return handleResponse(res, 401, "Invalid token");
  }
};
