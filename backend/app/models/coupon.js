import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    type: {
        type: String,
        enum: ['percentage', 'fixed', 'free_delivery', 'buyXgetY', 'bulk_discount', 'min_order_value', 'new_partner', 'category_based', 'monthly_volume'],
        required: true
    },
    value: {
        type: Number,
        default: 0
    },
    // Buy X Get Y details
    buyQty: {
        type: Number,
        default: 0
    },
    buyUnit: {
        type: String,
        default: 'unit'
    },
    getQty: {
        type: Number,
        default: 0
    },
    getUnit: {
        type: String,
        default: 'unit'
    },
    minOrderValue: {
        type: Number,
        default: 0
    },
    maxDiscount: {
        type: Number,
        default: 0
    },
    applicableCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    isFirstTimeUserOnly: {
        type: Boolean,
        default: false
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: Date,
    usageLimit: {
        type: Number,
        default: null // null means unlimited
    },
    usageLimitPerUser: {
        type: Number,
        default: 1
    },
    timesUsed: {
        type: Number,
        default: 0
    },
    isVisible: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    monthlyVolumeRequirement: {
        type: Number,
        default: 0
    },
    createdBy: {
        adminId: mongoose.Schema.Types.ObjectId,
        adminName: String,
        adminRole: String
    }
}, { timestamps: true });

export default mongoose.model('Coupon', couponSchema);
