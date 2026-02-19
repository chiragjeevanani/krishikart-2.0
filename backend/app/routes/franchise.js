import express from "express";
import {
  registerFranchise,
  verifyFranchiseOTP,
  getFranchiseMe,
  sendFranchiseOTP,
  updateFranchiseProfile,
  changeFranchisePassword,
  uploadFranchiseDocuments,
} from "../controllers/franchise.auth.js";
import {
  submitKYC,
  getKYCStatus,
  getInventory,
  updateStoreQRCode,
  resetInventoryStock,
  getActiveFranchises
} from "../controllers/franchise.controller.js";
import {
  createPOSSale,
  getPOSHistory
} from "../controllers/franchise.pos.controller.js";
import { protectFranchise } from "../middlewares/franchise.auth.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/register", registerFranchise);
router.post("/send-otp", sendFranchiseOTP);
router.post("/verify-otp", verifyFranchiseOTP);
router.get("/me", protectFranchise, getFranchiseMe);
router.put("/update", protectFranchise, updateFranchiseProfile);
router.post("/change-password", protectFranchise, changeFranchisePassword);
router.post("/upload-documents", protectFranchise, upload.array("documents", 5), uploadFranchiseDocuments);

router.post(
  "/kyc/submit",
  protectFranchise,
  upload.fields([{ name: 'aadhaarImage', maxCount: 1 }, { name: 'panImage', maxCount: 1 }]),
  submitKYC
);
router.get("/kyc/status", protectFranchise, getKYCStatus);
router.get("/inventory", protectFranchise, getInventory);
router.get("/active-stores", getActiveFranchises);

/* 🛒 POS Terminal */
router.post("/pos/sale", protectFranchise, createPOSSale);
router.get("/pos/history", protectFranchise, getPOSHistory);
router.put("/qr-code", protectFranchise, upload.single('qrCode'), updateStoreQRCode);
router.post("/inventory/reset", protectFranchise, resetInventoryStock);

export default router;
