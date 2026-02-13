import jwt from "jsonwebtoken";
import MasterAdmin from "../models/masteradmin.js";
import handleResponse from "../utils/helper.js";

export const protectMasterAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token)
      return handleResponse(res, 401, "Token required");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await MasterAdmin.findById(decoded.id);
    if (!admin)
      return handleResponse(res, 401, "Unauthorized");

    req.masteradmin = admin;
    next();
  } catch (err) {
    return handleResponse(res, 401, "Invalid token");
  }
};
