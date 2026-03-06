import express from "express";
import {
  createMasterAdmin,
  loginMasterAdmin,
  getMasterAdminMe,
  forgotMasterAdminPassword,
  resetMasterAdminPassword,
  updateMasterAdminProfile,
  changeMasterAdminPassword,
  createSubAdmin,
  listSubAdmins,
  updateSubAdmin,
  deleteSubAdmin,
  saveFCMToken
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
  updateFranchiseServiceArea,
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
  getLoyaltyConfigHistory,
  getAdminDashboardStats,
  getAdminAnalyticsStats,
  testPushNotification,
  globalSearch
} from "../controllers/masteradmin.controller.js";

import { protectMasterAdmin, requirePermission } from "../middlewares/masteradmin.auth.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/create", createMasterAdmin);
router.post("/login", loginMasterAdmin);
router.get("/me", protectMasterAdmin, getMasterAdminMe);
router.put("/update", protectMasterAdmin, updateMasterAdminProfile);
router.post("/change-password", protectMasterAdmin, changeMasterAdminPassword);
router.post("/forgot-password", forgotMasterAdminPassword);
router.post("/reset-password", resetMasterAdminPassword);
router.post("/fcm-token", protectMasterAdmin, saveFCMToken);

/* 🏪 Vendor Management */
router.get("/vendors", protectMasterAdmin, requirePermission("vendors"), getAllVendors);
router.post("/vendors", protectMasterAdmin, upload.fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "aadharFile", maxCount: 1 },
  { name: "panFile", maxCount: 1 },
  { name: "shopProofFile", maxCount: 1 }
]), createVendorByAdmin);
router.get("/vendors/:id", protectMasterAdmin, requirePermission("vendors"), getVendorDetails);
router.put("/vendors/:id/status", protectMasterAdmin, requirePermission("vendors"), updateVendorStatus);
router.put("/vendors/:id/products", protectMasterAdmin, requirePermission("products"), assignProductsToVendor);

/* 🏪 Franchise Management */
router.get("/franchises", protectMasterAdmin, requirePermission("franchises"), getAllFranchises);
router.post("/franchises", protectMasterAdmin, upload.fields([
  { name: "aadhaarImage", maxCount: 1 },
  { name: "panImage", maxCount: 1 }
]), createFranchiseByAdmin);
router.get("/franchises/kyc/pending", protectMasterAdmin, requirePermission("approvals"), getPendingKYCFranchises);
router.get("/franchises/:id", protectMasterAdmin, requirePermission("franchises"), getFranchiseDetails);
router.put("/franchises/:id/status", protectMasterAdmin, requirePermission("franchises"), updateFranchiseStatus);
router.put("/franchises/:id/service-area", protectMasterAdmin, requirePermission("franchises"), updateFranchiseServiceArea);
router.put("/franchises/:id/kyc-review", protectMasterAdmin, requirePermission("approvals"), reviewFranchiseKYC);

/* 👥 Customer Management */
router.get("/customers", protectMasterAdmin, requirePermission("credit"), getAllCustomers);
router.get("/customers/:id", protectMasterAdmin, requirePermission("credit"), getCustomerDetails);
router.put("/customers/:id/credit", protectMasterAdmin, requirePermission("credit"), updateCustomerCredit);

/* 📊 Inventory Monitoring */
router.get("/inventory/monitoring", protectMasterAdmin, requirePermission("stock-monitoring"), getGlobalInventoryMonitoring);
router.get("/inventory/franchise/:id", protectMasterAdmin, requirePermission("stock-monitoring"), getFranchiseInventoryDetails);

/* 💰 Commission Management */
router.get("/franchise/:id/commissions", protectMasterAdmin, requirePermission("commission"), getFranchiseCommissions);
router.post("/commissions/update", protectMasterAdmin, requirePermission("commission"), updateFranchiseCommission);
router.get("/franchise-payouts", protectMasterAdmin, getFranchisePayoutsSummary);
router.get("/cod/remittances", protectMasterAdmin, getCodRemittances);
router.put("/cod/remittances/:remittanceId/review", protectMasterAdmin, reviewCodRemittance);

/* ⚙️ System Settings */
router.get("/settings", protectMasterAdmin, requirePermission("settings"), getGlobalSettings);
router.post("/settings/update", protectMasterAdmin, requirePermission("settings"), updateGlobalSetting);
router.get("/loyalty/history", protectMasterAdmin, getLoyaltyConfigHistory);
router.get("/public-settings", getGlobalSettings); // Public route for user app
/* 👥 Sub-Admin Management (SuperAdmin Only) */
router.get("/subadmins", protectMasterAdmin, listSubAdmins);
router.post("/subadmins", protectMasterAdmin, createSubAdmin);
router.put("/subadmins/:id", protectMasterAdmin, updateSubAdmin);
router.delete("/subadmins/:id", protectMasterAdmin, deleteSubAdmin);

router.get("/returns", protectMasterAdmin, getAllReturnRequests);
router.get("/dashboard/stats", protectMasterAdmin, getAdminDashboardStats);
router.get("/search", protectMasterAdmin, globalSearch);
router.post("/test-notification", protectMasterAdmin, testPushNotification);


export default router;
