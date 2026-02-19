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
import { getAllDeliveryPartners } from "../controllers/delivery.controller.js";

const router = express.Router();
router.post("/register", registerDelivery);


router.post("/send-otp", sendDeliveryOTP);
router.post("/verify-otp", verifyDeliveryOTP);

router.get("/me", protectDelivery, getDeliveryMe);

router.post("/forgot-password", forgotDeliveryPassword);
router.post("/reset-password", resetDeliveryPassword);
router.put("/profile", protectDelivery, updateDeliveryProfile);

// Public/Franchise access to partners list
router.get("/partners", protectFranchise, getAllDeliveryPartners);

export default router;
