import jwt from "jsonwebtoken";
import MasterAdmin from "../models/masteradmin.js";
import SubAdmin from "../models/subAdmin.js";
import handleResponse from "../utils/helper.js";

export const protectMasterAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token)
      return handleResponse(res, 401, "Token required");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let admin = await MasterAdmin.findById(decoded.id);
    if (!admin) {
      admin = await SubAdmin.findById(decoded.id);
    }

    if (!admin)
      return handleResponse(res, 401, "Unauthorized");

    if (admin.status === "blocked") {
      return handleResponse(res, 403, "Your account has been blocked");
    }

    req.masteradmin = admin;
    next();
  } catch (err) {
    return handleResponse(res, 401, "Invalid token");
  }
};

export const requirePermission = (permissionKey) => {
  return (req, res, next) => {
    const admin = req.masteradmin;

    if (!admin) {
      return handleResponse(res, 401, "Authentication required");
    }

    // Root Admin bypass (SuperAdmin or MasterAdmin)
    const role = admin.role?.toLowerCase();
    if (role === "superadmin" || role === "masteradmin") {
      return next();
    }

    // SubAdmin check
    if (admin.role === "subadmin" && admin.permissions && admin.permissions.includes(permissionKey)) {
      return next();
    }

    return handleResponse(res, 403, `Permission denied: ${permissionKey} access required`);
  };
};
