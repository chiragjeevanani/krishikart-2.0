import jwt from "jsonwebtoken";
import Franchise from "../models/franchise.js";
import handleResponse from "../utils/helper.js";

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
    next();
  } catch (err) {
    return handleResponse(res, 401, "Invalid token");
  }
};
