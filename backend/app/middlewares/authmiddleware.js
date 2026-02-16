import jwt from "jsonwebtoken";
import User from "../models/user.js";
import handleResponse from "../utils/helper.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token)
      return handleResponse(res, 401, "Token required");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password -otp");
    next();
  } catch (error) {
    return handleResponse(res, 401, "Invalid or expired token");
  }
};
