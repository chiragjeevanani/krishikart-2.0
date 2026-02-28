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
  createVendorByAdmin,
  getAllVendors,
  updateVendorStatus,
  getVendorDetails,
  createFranchiseByAdmin,
  getAllFranchises,
  getFranchiseDetails,
  updateFranchiseStatus,
  getPendingKYCFranchises,
  reviewFranchiseKYC,
  getAllCustomers,
  getCustomerDetails,
  updateCustomerCredit,
  assignProductsToVendor,
  getGlobalInventoryMonitoring,
  getFranchiseInventoryDetails,
  updateFranchiseCommission,
  getFranchiseCommissions,
  getFranchisePayoutsSummary,
  getCodRemittances,
  reviewCodRemittance,
  getGlobalSettings,
  updateGlobalSetting,
  getAllReturnRequests,
  getLoyaltyConfigHistory
} from "../controllers/masteradmin.controller.js";

import { protectMasterAdmin } from "../middlewares/masteradmin.auth.js";
import upload from "../middlewares/upload.js";

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
router.post("/vendors", protectMasterAdmin, upload.fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "aadharFile", maxCount: 1 },
  { name: "panFile", maxCount: 1 },
  { name: "shopProofFile", maxCount: 1 }
]), createVendorByAdmin);
router.get("/vendors/:id", protectMasterAdmin, getVendorDetails);
router.put("/vendors/:id/status", protectMasterAdmin, updateVendorStatus);
router.put("/vendors/:id/products", protectMasterAdmin, assignProductsToVendor);

/* 🏪 Franchise Management */
router.get("/franchises", protectMasterAdmin, getAllFranchises);
router.post("/franchises", protectMasterAdmin, upload.fields([
  { name: "aadhaarImage", maxCount: 1 },
  { name: "panImage", maxCount: 1 }
]), createFranchiseByAdmin);
router.get("/franchises/kyc/pending", protectMasterAdmin, getPendingKYCFranchises);
router.get("/franchises/:id", protectMasterAdmin, getFranchiseDetails);
router.put("/franchises/:id/status", protectMasterAdmin, updateFranchiseStatus);
router.put("/franchises/:id/kyc-review", protectMasterAdmin, reviewFranchiseKYC);

/* 👥 Customer Management */
router.get("/customers", protectMasterAdmin, getAllCustomers);
router.get("/customers/:id", protectMasterAdmin, getCustomerDetails);
router.put("/customers/:id/credit", protectMasterAdmin, updateCustomerCredit);

/* 📊 Inventory Monitoring */
router.get("/inventory/monitoring", protectMasterAdmin, getGlobalInventoryMonitoring);
router.get("/inventory/franchise/:id", protectMasterAdmin, getFranchiseInventoryDetails);

/* 💰 Commission Management */
router.get("/franchise/:id/commissions", protectMasterAdmin, getFranchiseCommissions);
router.post("/commissions/update", protectMasterAdmin, updateFranchiseCommission);
router.get("/franchise-payouts", protectMasterAdmin, getFranchisePayoutsSummary);
router.get("/cod/remittances", protectMasterAdmin, getCodRemittances);
router.put("/cod/remittances/:remittanceId/review", protectMasterAdmin, reviewCodRemittance);

/* ⚙️ System Settings */
router.get("/settings", protectMasterAdmin, getGlobalSettings);
router.post("/settings/update", protectMasterAdmin, updateGlobalSetting);
router.get("/loyalty/history", protectMasterAdmin, getLoyaltyConfigHistory);
router.get("/public-settings", getGlobalSettings); // Public route for user app
router.get("/returns", protectMasterAdmin, getAllReturnRequests);

export default router;
