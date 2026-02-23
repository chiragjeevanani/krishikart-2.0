import express from "express";
import {
    createProcurementRequest,
    getMyProcurementRequests,
    getAllProcurementRequests,
    adminUpdateProcurementRequest,
    getVendorAssignments,
    getVendorProcurementById,
    vendorSubmitQuotation,
    getVendorActiveDispatch,
    vendorUpdateStatus,
    getVendorReports,
    franchiseConfirmReceipt
} from "../controllers/procurement.controller.js";
import { protectFranchise } from "../middlewares/franchise.auth.js";
import { protectMasterAdmin } from "../middlewares/masteradmin.auth.js";
import { protectVendor } from "../middlewares/vendor.auth.js";

const router = express.Router();

// Franchise Routes (Request)
router.post("/franchise/create", protectFranchise, createProcurementRequest);
router.get("/franchise/my-requests", protectFranchise, getMyProcurementRequests);
router.put("/franchise/:requestId/receive", protectFranchise, franchiseConfirmReceipt);

// Vendor Routes (View Assignment)
router.get("/vendor/my-assignments", protectVendor, getVendorAssignments);
router.get("/vendor/:requestId", protectVendor, getVendorProcurementById);
router.get("/vendor/active-dispatch", protectVendor, getVendorActiveDispatch);
router.post("/vendor/:requestId/quote", protectVendor, vendorSubmitQuotation);
router.put("/vendor/:requestId/status", protectVendor, vendorUpdateStatus);

// Admin Routes (Assign/View)
router.get("/admin/all", protectMasterAdmin, getAllProcurementRequests);
router.get("/admin/reports", protectMasterAdmin, getVendorReports);
router.put("/admin/:requestId/status", protectMasterAdmin, adminUpdateProcurementRequest);

export default router;
