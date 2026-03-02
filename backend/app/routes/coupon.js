import express from 'express';
import {
    createCoupon,
    getAllCoupons,
    updateCoupon,
    deleteCoupon,
    getVisibleCoupons,
    validateCoupon,
    getCouponById
} from '../controllers/coupon.controller.js';
import { protectMasterAdmin, requirePermission } from '../middlewares/masteradmin.auth.js';
import { protect } from '../middlewares/authmiddleware.js';

const router = express.Router();

/**
 * Admin: Master Admin Coupon Management
 */
router.post('/admin', protectMasterAdmin, requirePermission('campaigns'), createCoupon);
router.get('/admin', protectMasterAdmin, requirePermission('campaigns'), getAllCoupons);
router.get('/admin/:id', protectMasterAdmin, requirePermission('campaigns'), getCouponById);
router.put('/admin/:id', protectMasterAdmin, requirePermission('campaigns'), updateCoupon);
router.delete('/admin/:id', protectMasterAdmin, requirePermission('campaigns'), deleteCoupon);

/**
 * User: Coupon Interaction
 */
router.get('/visible', protect, getVisibleCoupons);
router.post('/validate', protect, validateCoupon);

export default router;
