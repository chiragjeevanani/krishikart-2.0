import express from "express";
import {
    registerVendor,
    loginVendor,
    getVendorMe,
    forgotVendorPassword,
    resetVendorPassword,
} from "../controllers/vendor.auth.js";



import { protectVendor } from "../middlewares/vendor.auth.js";

const router = express.Router();

router.post("/register", registerVendor);
router.post("/login", loginVendor);
router.get("/me", protectVendor, getVendorMe);
router.post("/forgot-password", forgotVendorPassword);
router.post("/reset-password", resetVendorPassword);


export default router;
