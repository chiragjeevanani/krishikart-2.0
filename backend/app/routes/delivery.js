import express from "express";
import {
  registerDelivery,
  sendDeliveryOTP,
  verifyDeliveryOTP,
  getDeliveryMe,
  forgotDeliveryPassword,
  resetDeliveryPassword,
  updateDeliveryProfile,
} from "../controllers/delivery.auth.js";


import { protectDelivery } from "../middlewares/delivery.auth.js";

const router = express.Router();
router.post("/register", registerDelivery);


router.post("/send-otp", sendDeliveryOTP);
router.post("/verify-otp", verifyDeliveryOTP);

router.get("/me", protectDelivery, getDeliveryMe);

router.post("/forgot-password", forgotDeliveryPassword);
router.post("/reset-password", resetDeliveryPassword);
router.put("/profile", protectDelivery, updateDeliveryProfile);

export default router;
