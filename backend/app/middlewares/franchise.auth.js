import jwt from "jsonwebtoken";
import Franchise from "../models/franchise.js";
import { handleResponse } from "../utils/helper.js";

export const protectFranchise = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return handleResponse(res, 401, "Token required");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const franchise = await Franchise.findById(decoded.id);
    if (!franchise)
      return handleResponse(res, 401, "Unauthorized");

    req.franchise = franchise;
    // Isolation: never trust client-supplied franchiseId; only req.franchise._id is valid
    if (req.body) delete req.body.franchiseId;
    if (req.query) delete req.query.franchiseId;
    next();
  } catch (err) {
    const raw = req.headers.authorization || "";
    const short = raw ? String(raw).slice(0, 24) : "";
    console.error("[protectFranchise] JWT verify failed:", {
      message: err?.message,
      name: err?.name,
      authHeaderPrefix: short,
    });
    return handleResponse(res, 401, "Invalid token");
  }
};

/** Blocks operational routes until master admin sets `isVerified` (separate from phone OTP). */
export const requireFranchiseAccountVerified = (req, res, next) => {
  if (!req.franchise?.isVerified) {
    return handleResponse(
      res,
      403,
      "Franchise pending admin verification. Use Documentation until your profile is approved.",
    );
  }
  next();
};
