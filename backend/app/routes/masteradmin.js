import express from "express";
import {
  createMasterAdmin,
  loginMasterAdmin,
  getMasterAdminMe,
  forgotMasterAdminPassword,
  resetMasterAdminPassword,
  updateMasterAdminProfile,
  changeMasterAdminPassword,
} from "../controllers/masteradmin.auth.js";
import {
  getAllVendors,
  updateVendorStatus,
  getVendorDetails
} from "../controllers/masteradmin.controller.js";

import { protectMasterAdmin } from "../middlewares/masteradmin.auth.js";

const router = express.Router();

router.post("/create", createMasterAdmin);
router.post("/login", loginMasterAdmin);
router.get("/me", protectMasterAdmin, getMasterAdminMe);
router.put("/update", protectMasterAdmin, updateMasterAdminProfile);
router.post("/change-password", protectMasterAdmin, changeMasterAdminPassword);
router.post("/forgot-password", forgotMasterAdminPassword);
router.post("/reset-password", resetMasterAdminPassword);

/* 🏪 Vendor Management */
router.get("/vendors", protectMasterAdmin, getAllVendors);
router.get("/vendors/:id", protectMasterAdmin, getVendorDetails);
router.put("/vendors/:id/status", protectMasterAdmin, updateVendorStatus);

export default router;
