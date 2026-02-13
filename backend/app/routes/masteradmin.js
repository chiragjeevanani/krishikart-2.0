import express from "express";
import {
  createMasterAdmin,
  loginMasterAdmin,
  getMasterAdminMe,
  forgotMasterAdminPassword,
  resetMasterAdminPassword,
} from "../controllers/masteradmin.auth.js";

import { protectMasterAdmin } from "../middlewares/masteradmin.auth.js";

const router = express.Router();

router.post("/create", createMasterAdmin);
router.post("/login", loginMasterAdmin);
router.get("/me", protectMasterAdmin, getMasterAdminMe);
router.post("/forgot-password", forgotMasterAdminPassword);
router.post("/reset-password", resetMasterAdminPassword);

export default router;
