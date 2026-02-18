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
  getInventory
} from "../controllers/franchise.controller.js";
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

export default router;
