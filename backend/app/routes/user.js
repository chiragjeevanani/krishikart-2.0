
import express from "express";
import { sendOTP, verifyOTP, forgotPassword, resetPassword, getMe, updateUserProfile, changeUserPassword } from "../controllers/user.auth.js";
import {
    getCart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    getWishlist,
    toggleWishlist,
    removeFromWishlist
} from "../controllers/user.action.controller.js";
import { protect } from "../middlewares/authmiddleware.js";

const router = express.Router();

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateUserProfile);
router.post("/change-password", protect, changeUserPassword);

// Cart Routes
router.get("/cart", protect, getCart);
router.post("/cart/add", protect, addToCart);
router.put("/cart/update", protect, updateCartQuantity);
router.delete("/cart/remove/:productId", protect, removeFromCart);

// Wishlist Routes
router.get("/wishlist", protect, getWishlist);
router.post("/wishlist/toggle", protect, toggleWishlist);
router.delete("/wishlist/remove/:productId", protect, removeFromWishlist);


export default router;
