import jwt from "jsonwebtoken";
import Delivery from "../models/delivery.js";
import handleResponse from "../utils/helper.js";

export const protectDelivery = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token)
      return handleResponse(res, 401, "Token required");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const delivery = await Delivery.findById(decoded.id);
    if (!delivery)
      return handleResponse(res, 401, "Unauthorized");

    req.delivery = delivery;
    next();
  } catch (err) {
    return handleResponse(res, 401, "Invalid token");
  }
};
