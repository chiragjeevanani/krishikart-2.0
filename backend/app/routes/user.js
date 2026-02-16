
import express from "express";
import { sendOTP, verifyOTP, forgotPassword, resetPassword, getMe, updateUserProfile, changeUserPassword } from "../controllers/user.auth.js";
import { protect } from "../middlewares/authmiddleware.js";

const router = express.Router();

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateUserProfile);
router.post("/change-password", protect, changeUserPassword);


export default router;
