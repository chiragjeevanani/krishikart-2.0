import express from "express";
import {
  registerFranchise,
  verifyFranchiseOTP,
  getFranchiseMe,
  sendFranchiseOTP,
} from "../controllers/franchise.auth.js";


import { protectFranchise } from "../middlewares/franchise.auth.js";

const router = express.Router();

router.post("/register", registerFranchise);
router.post("/send-otp", sendFranchiseOTP);
router.post("/verify-otp", verifyFranchiseOTP);
router.get("/me", protectFranchise, getFranchiseMe);

export default router;
