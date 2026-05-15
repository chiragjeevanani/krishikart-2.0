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
    getVendorDashboardStats,
    getVendorReceivablesReport,
    franchiseConfirmReceipt,
    createProcurementFromOrder,
    getRejectedStockReport
} from "../controllers/procurement.controller.js";
import {
    protectFranchise,
    requireFranchiseAccountVerified,
} from "../middlewares/franchise.auth.js";
import { protectMasterAdmin } from "../middlewares/masteradmin.auth.js";
import { protectVendor } from "../middlewares/vendor.auth.js";

const router = express.Router();

// Franchise Routes (Request)
router.post(
    "/franchise/create",
    protectFranchise,
    requireFranchiseAccountVerified,
    createProcurementRequest,
);
router.get(
    "/franchise/my-requests",
    protectFranchise,
    requireFranchiseAccountVerified,
    getMyProcurementRequests,
);
router.put(
    "/franchise/:requestId/receive",
    protectFranchise,
    requireFranchiseAccountVerified,
    franchiseConfirmReceipt,
);

// Vendor Routes (View Assignment)
router.get("/vendor/my-assignments", protectVendor, getVendorAssignments);
router.get("/vendor/active-dispatch", protectVendor, getVendorActiveDispatch);
router.get("/vendor/dashboard-stats", protectVendor, getVendorDashboardStats);
router.get("/vendor/receivables-report", protectVendor, getVendorReceivablesReport);
router.get("/vendor/rejected-stock", protectVendor, getRejectedStockReport);
router.get("/vendor/:requestId", protectVendor, getVendorProcurementById);
router.post("/vendor/:requestId/quote", protectVendor, vendorSubmitQuotation);
router.put("/vendor/:requestId/status", protectVendor, vendorUpdateStatus);

// Admin Routes (Assign/View)
router.get("/admin/all", protectMasterAdmin, getAllProcurementRequests);
router.get("/admin/reports", protectMasterAdmin, getVendorReports);
router.get("/admin/rejected-stock", protectMasterAdmin, getRejectedStockReport);
router.put("/admin/:requestId/status", protectMasterAdmin, adminUpdateProcurementRequest);
router.post("/admin/from-order/:orderId", protectMasterAdmin, createProcurementFromOrder);

export default router;
