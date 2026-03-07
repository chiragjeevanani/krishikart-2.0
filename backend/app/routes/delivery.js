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
import { protectFranchise } from "../middlewares/franchise.auth.js";
import upload from "../middlewares/upload.js";
import {
  getAllDeliveryPartners,
  getMyCodSummary,
  submitCodRemittance,
  createCodRazorpayOrder,
  verifyCodUpiPayment,
  getMyCodRemittances,
  updateAvailability,
  saveFCMToken,
  testPushByToken
} from "../controllers/delivery.controller.js";

const router = express.Router();
router.post("/register", upload.fields([
  { name: "aadharImage", maxCount: 1 },
  { name: "panImage", maxCount: 1 },
  { name: "licenseImage", maxCount: 1 }
]), registerDelivery);


router.post("/send-otp", sendDeliveryOTP);
router.post("/verify-otp", verifyDeliveryOTP);

router.get("/me", protectDelivery, getDeliveryMe);

router.post("/forgot-password", forgotDeliveryPassword);
router.post("/reset-password", resetDeliveryPassword);
router.put("/profile", protectDelivery, updateDeliveryProfile);

// Public/Franchise access to partners list
router.get("/partners", protectFranchise, getAllDeliveryPartners);
router.get("/cod/summary", protectDelivery, getMyCodSummary);
router.get("/cod/remittances", protectDelivery, getMyCodRemittances);
router.post("/cod/remittance", protectDelivery, submitCodRemittance);
router.post("/cod/razorpay-order", protectDelivery, createCodRazorpayOrder);
router.post("/cod/verify-upi", protectDelivery, verifyCodUpiPayment);
router.put("/availability", protectDelivery, updateAvailability);
router.post("/fcm-token", protectDelivery, saveFCMToken);
router.post("/test-notification", protectDelivery, testPushByToken);

export default router;
