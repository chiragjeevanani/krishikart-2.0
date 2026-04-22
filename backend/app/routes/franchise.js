import express from "express";
import {
  registerFranchise,
  verifyFranchiseOTP,
  getFranchiseMe,
  sendFranchiseOTP,
  updateFranchiseProfile,
  changeFranchisePassword,
  uploadFranchiseDocuments,
  loginFranchiseWithPassword,
} from "../controllers/franchise.auth.js";
import {
  submitKYC,
  getKYCStatus,
  getFranchisePayoutReport,
  getFranchiseAdminPayoutsReceived,
  getInventory,
  updateStoreQRCode,
  resetInventoryStock,
  getActiveFranchises,
  updateAvailability,
  saveFCMToken,
  testPushByToken
} from "../controllers/franchise.controller.js";
import {
  createPOSSale,
  getPOSHistory
} from "../controllers/franchise.pos.controller.js";
import {
  protectFranchise,
  requireFranchiseAccountVerified,
} from "../middlewares/franchise.auth.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/register", registerFranchise);
router.post("/send-otp", sendFranchiseOTP);
router.post("/verify-otp", verifyFranchiseOTP);
router.post("/login", loginFranchiseWithPassword);
router.get("/me", protectFranchise, getFranchiseMe);
router.put(
  "/update",
  protectFranchise,
  requireFranchiseAccountVerified,
  updateFranchiseProfile,
);
router.post("/change-password", protectFranchise, changeFranchisePassword);
router.post("/upload-documents", protectFranchise, upload.array("documents", 5), uploadFranchiseDocuments);

router.post(
  "/kyc/submit",
  protectFranchise,
  upload.fields([
    { name: "aadhaarImage", maxCount: 1 },
    { name: "panImage", maxCount: 1 },
    { name: "fssaiCertificate", maxCount: 1 },
    { name: "shopEstablishmentCertificate", maxCount: 1 },
    { name: "gstCertificate", maxCount: 1 },
  ]),
  submitKYC,
);
router.get("/kyc/status", protectFranchise, getKYCStatus);
router.get(
  "/reports/payout-summary",
  protectFranchise,
  requireFranchiseAccountVerified,
  getFranchisePayoutReport,
);
router.get(
  "/reports/admin-payouts",
  protectFranchise,
  requireFranchiseAccountVerified,
  getFranchiseAdminPayoutsReceived,
);
router.get(
  "/inventory",
  protectFranchise,
  requireFranchiseAccountVerified,
  getInventory,
);
router.get("/active-stores", getActiveFranchises);

/* 🛒 POS Terminal */
router.post(
  "/pos/sale",
  protectFranchise,
  requireFranchiseAccountVerified,
  createPOSSale,
);
router.get(
  "/pos/history",
  protectFranchise,
  requireFranchiseAccountVerified,
  getPOSHistory,
);
router.put(
  "/qr-code",
  protectFranchise,
  requireFranchiseAccountVerified,
  upload.single("qrCode"),
  updateStoreQRCode,
);
router.post(
  "/availability",
  protectFranchise,
  requireFranchiseAccountVerified,
  updateAvailability,
);
router.post("/fcm-token", protectFranchise, saveFCMToken);
router.post(
  "/test-notification",
  protectFranchise,
  requireFranchiseAccountVerified,
  testPushByToken,
);
router.post(
  "/inventory/reset",
  protectFranchise,
  requireFranchiseAccountVerified,
  resetInventoryStock,
);

export default router;
