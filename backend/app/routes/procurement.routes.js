import express from "express";
import {
    createProcurementRequest,
    getMyProcurementRequests,
    getAllProcurementRequests,
    adminUpdateProcurementRequest
} from "../controllers/procurement.controller.js";
import { protectFranchise } from "../middlewares/franchise.auth.js";
import { protectMasterAdmin } from "../middlewares/masteradmin.auth.js";

const router = express.Router();

// Franchise Routes (Request)
router.post("/franchise/create", protectFranchise, createProcurementRequest);
router.get("/franchise/my-requests", protectFranchise, getMyProcurementRequests);

// Admin Routes (Assign/View)
router.get("/admin/all", protectMasterAdmin, getAllProcurementRequests);
router.put("/admin/:requestId/status", protectMasterAdmin, adminUpdateProcurementRequest);

export default router;
