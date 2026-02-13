
import express from "express";
import { sendOTP, verifyOTP,forgotPassword,resetPassword,getMe } from "../controllers/user.auth.js";
import { protect } from "../middlewares/authmiddleware.js";

const router = express.Router();

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);


export default router;
