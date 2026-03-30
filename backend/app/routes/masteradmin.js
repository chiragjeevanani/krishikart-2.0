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
  saveFCMToken,
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
  getFranchiseServiceMap,
  getPendingKYCFranchises,
  reviewFranchiseKYC,
  getAllCustomers,
  getCustomerDetails,
  updateCustomerCredit,
  assignProductsToVendor,
  getGlobalInventoryMonitoring,
  getFranchiseInventoryDetails,
  updateFranchiseInventoryItem,
  bulkUpdateFranchiseInventory,
  updateFranchiseCommission,
  getFranchiseCommissions,
  getFranchisePayoutsSummary,
  listFranchiseAdminPayouts,
  recordFranchiseAdminPayout,
  getCodRemittances,
  reviewCodRemittance,
  getGlobalSettings,
  updateGlobalSetting,
  getLegalCmsForAdmin,
  getPublicLegalPages,
  saveLegalCmsSection,
  getAllReturnRequests,
  getLoyaltyConfigHistory,
  getAdminDashboardStats,
  getAdminAnalyticsStats,
  testPushNotification,
  globalSearch,
  getAllDeliveryPartners,
  updateDeliveryStatus,
  createFAQ,
  getAllFAQs,
  getPublicFAQs,
  updateFAQ,
  deleteFAQ,
} from "../controllers/masteradmin.controller.js";

import {
  protectMasterAdmin,
  requirePermission,
} from "../middlewares/masteradmin.auth.js";
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
router.get(
  "/vendors",
  protectMasterAdmin,
  requirePermission("vendors"),
  getAllVendors,
);
router.post(
  "/vendors",
  protectMasterAdmin,
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "aadharFile", maxCount: 1 },
    { name: "panFile", maxCount: 1 },
    { name: "shopProofFile", maxCount: 1 },
  ]),
  createVendorByAdmin,
);
router.get(
  "/vendors/:id",
  protectMasterAdmin,
  requirePermission("vendors"),
  getVendorDetails,
);
router.put(
  "/vendors/:id/status",
  protectMasterAdmin,
  requirePermission("vendors"),
  updateVendorStatus,
);
router.put(
  "/vendors/:id/products",
  protectMasterAdmin,
  requirePermission("products"),
  assignProductsToVendor,
);

/* 🏪 Franchise Management */
router.get(
  "/franchises",
  protectMasterAdmin,
  requirePermission("franchises"),
  getAllFranchises,
);
router.post(
  "/franchises",
  protectMasterAdmin,
  upload.fields([
    { name: "aadhaarImage", maxCount: 1 },
    { name: "panImage", maxCount: 1 },
    { name: "fssaiCertificate", maxCount: 1 },
    { name: "shopEstablishmentCertificate", maxCount: 1 },
    { name: "gstCertificate", maxCount: 1 },
  ]),
  createFranchiseByAdmin,
);
router.get(
  "/franchises/kyc/pending",
  protectMasterAdmin,
  requirePermission("approvals"),
  getPendingKYCFranchises,
);
router.get(
  "/franchises/:id",
  protectMasterAdmin,
  requirePermission("franchises"),
  getFranchiseDetails,
);
router.put(
  "/franchises/:id/status",
  protectMasterAdmin,
  requirePermission("franchises"),
  updateFranchiseStatus,
);
router.put(
  "/franchises/:id/service-area",
  protectMasterAdmin,
  requirePermission("franchises"),
  updateFranchiseServiceArea,
);
router.get(
  "/franchise-service-map",
  protectMasterAdmin,
  requirePermission("franchises"),
  getFranchiseServiceMap,
);
router.put(
  "/franchises/:id/kyc-review",
  protectMasterAdmin,
  requirePermission("approvals"),
  reviewFranchiseKYC,
);

/* 🚚 Delivery Partner Management */
router.get(
  "/delivery-partners",
  protectMasterAdmin,
  requirePermission("approvals"),
  getAllDeliveryPartners,
);
router.put(
  "/delivery-partners/:id/status",
  protectMasterAdmin,
  requirePermission("approvals"),
  updateDeliveryStatus,
);

/* 👥 Customer Management */
router.get(
  "/customers",
  protectMasterAdmin,
  requirePermission("credit"),
  getAllCustomers,
);
router.get(
  "/customers/:id",
  protectMasterAdmin,
  requirePermission("credit"),
  getCustomerDetails,
);
router.put(
  "/customers/:id/credit",
  protectMasterAdmin,
  requirePermission("credit"),
  updateCustomerCredit,
);

/* 📊 Inventory Monitoring */
router.get(
  "/inventory/monitoring",
  protectMasterAdmin,
  requirePermission("stock-monitoring"),
  getGlobalInventoryMonitoring,
);
router.get(
  "/inventory/franchise/:id",
  protectMasterAdmin,
  requirePermission("stock-monitoring"),
  getFranchiseInventoryDetails,
);
router.put(
  "/inventory/franchise/:id/item",
  protectMasterAdmin,
  requirePermission("stock-monitoring"),
  updateFranchiseInventoryItem,
);
router.post(
  "/inventory/franchise/:id/bulk-update",
  protectMasterAdmin,
  requirePermission("stock-monitoring"),
  bulkUpdateFranchiseInventory,
);

/* 💰 Commission Management */
router.get(
  "/franchise/:id/commissions",
  protectMasterAdmin,
  requirePermission("commission"),
  getFranchiseCommissions,
);
router.post(
  "/commissions/update",
  protectMasterAdmin,
  requirePermission("commission"),
  updateFranchiseCommission,
);
router.get(
  "/franchise-payouts",
  protectMasterAdmin,
  getFranchisePayoutsSummary,
);
router.get(
  "/franchises/:id/admin-payouts",
  protectMasterAdmin,
  requirePermission("franchise-payouts"),
  listFranchiseAdminPayouts,
);
router.post(
  "/franchises/:id/admin-payouts",
  protectMasterAdmin,
  requirePermission("franchise-payouts"),
  recordFranchiseAdminPayout,
);
router.get("/cod/remittances", protectMasterAdmin, getCodRemittances);
router.put(
  "/cod/remittances/:remittanceId/review",
  protectMasterAdmin,
  reviewCodRemittance,
);

/* ⚙️ System Settings */
router.get(
  "/settings",
  protectMasterAdmin,
  requirePermission("settings"),
  getGlobalSettings,
);
router.post(
  "/settings/update",
  protectMasterAdmin,
  requirePermission("settings"),
  updateGlobalSetting,
);
router.get("/loyalty/history", protectMasterAdmin, getLoyaltyConfigHistory);
router.get("/public-settings", getGlobalSettings); // Public route for user app
router.get("/public-faqs", getPublicFAQs); // Public route for user app
router.get("/public/legal-pages", getPublicLegalPages);

/* Terms, Privacy, Contact — master admin CMS */
router.get(
  "/legal-cms",
  protectMasterAdmin,
  requirePermission("settings"),
  getLegalCmsForAdmin,
);
router.post(
  "/legal-cms",
  protectMasterAdmin,
  requirePermission("settings"),
  saveLegalCmsSection,
);

/* ❓ FAQ Management */
router.get(
  "/faqs",
  protectMasterAdmin,
  requirePermission("settings"),
  getAllFAQs,
);
router.post(
  "/faqs",
  protectMasterAdmin,
  requirePermission("settings"),
  createFAQ,
);
router.put(
  "/faqs/:id",
  protectMasterAdmin,
  requirePermission("settings"),
  updateFAQ,
);
router.delete(
  "/faqs/:id",
  protectMasterAdmin,
  requirePermission("settings"),
  deleteFAQ,
);
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
