import express from "express";
import {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    getAllOrders,
    getFranchiseOrders,
    getFranchiseOrderById,
    acceptFranchiseOrder,
    assignDeliveryPartner,
    getDispatchedOrders,
    getDeliveryOrderHistory,
    getAdminDeliveryTracking
} from "../controllers/order.controller.js";
import { protect } from "../middlewares/authmiddleware.js";
import { protectMasterAdmin } from "../middlewares/masteradmin.auth.js";
import { protectFranchise } from "../middlewares/franchise.auth.js";
import { protectDelivery } from "../middlewares/delivery.auth.js";

const router = express.Router();

// User Routes
router.post("/place", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.put("/:id/status", protect, updateOrderStatus);

// Admin Routes
router.get("/admin/all", protectMasterAdmin, getAllOrders);
router.get("/admin/delivery-tracking", protectMasterAdmin, getAdminDeliveryTracking);
router.get("/admin/:id", protectMasterAdmin, getOrderById);
router.put("/admin/:id/status", protectMasterAdmin, updateOrderStatus);

// Franchise Routes
router.get("/franchise/all", protectFranchise, getFranchiseOrders);
router.get("/franchise/:id", protectFranchise, getFranchiseOrderById);
router.put("/franchise/:id/accept", protectFranchise, acceptFranchiseOrder);
router.put("/franchise/:id/assign-delivery", protectFranchise, assignDeliveryPartner);
router.put("/franchise/:id/status", protectFranchise, updateOrderStatus);

// Delivery Routes
router.get("/delivery/dispatched", protectDelivery, getDispatchedOrders);
router.get("/delivery/history", protectDelivery, getDeliveryOrderHistory);
router.put("/delivery/:id/status", protectDelivery, updateOrderStatus);

router.get("/:id", protect, getOrderById);

export default router;
