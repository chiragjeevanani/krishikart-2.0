import mongoose from 'mongoose';

const productRecommendationSchema = new mongoose.Schema({
    sourceProduct: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        unique: true
    },
    recommendedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    label: {
        type: String,
        trim: true,
        default: 'Frequently Bought Together'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MasterAdmin'
    }
}, {
    timestamps: true
});

// Index for faster lookups
productRecommendationSchema.index({ sourceProduct: 1 });

const ProductRecommendation = mongoose.model('ProductRecommendation', productRecommendationSchema);

export default ProductRecommendation;
