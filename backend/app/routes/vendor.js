import express from "express";
import {
    registerVendor,
    loginVendor,
    getVendorMe,
    updateVendorProfile,
    forgotVendorPassword,
    resetVendorPassword,
    changeVendorPassword,
} from "../controllers/vendor.auth.js";



import { protectVendor } from "../middlewares/vendor.auth.js";

const router = express.Router();

import upload from "../middlewares/upload.js";

router.post("/register", upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "aadharFile", maxCount: 1 },
    { name: "panFile", maxCount: 1 },
    { name: "shopProofFile", maxCount: 1 }
]), registerVendor);
router.post("/login", loginVendor);
router.get("/me", protectVendor, getVendorMe);
router.put("/update", protectVendor, upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "aadharFile", maxCount: 1 },
    { name: "panFile", maxCount: 1 },
    { name: "shopProofFile", maxCount: 1 }
]), updateVendorProfile);
router.post("/forgot-password", forgotVendorPassword);
router.post("/reset-password", resetVendorPassword);
router.post("/change-password", protectVendor, changeVendorPassword);


export default router;
