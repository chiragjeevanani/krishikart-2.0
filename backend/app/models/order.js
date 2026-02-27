import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: String,
    image: String,
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    unit: String,
    price: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    },
    isBulkRate: {
        type: Boolean,
        default: false
    },
    isShortage: {
        type: Boolean,
        default: false
    },
    shortageQty: {
        type: Number,
        default: 0
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Relaxed for legacy support
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    franchiseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Franchise',
        default: null
    },
    deliveryPartnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Delivery',
        default: null
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    },
    deliveryFee: {
        type: Number,
        default: 0
    },
    platformFee: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    paymentMethod: {
        type: String,
        enum: ['Wallet', 'Credit', 'UPI', 'Card', 'COD'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
        default: 'Pending'
    },
    orderStatus: {
        type: String,
        enum: ['Placed', 'Procuring', 'Packed', 'Dispatched', 'Delivered', 'Received', 'Cancelled'],
        default: 'Placed'
    },
    statusHistory: [
        {
            status: String,
            updatedAt: { type: Date, default: Date.now },
            updatedBy: String // role like 'user', 'franchise', 'delivery'
        }
    ],
    shippingAddress: {
        type: String,
        required: true
    },
    shippingLocation: {
        lat: Number,
        lng: Number,
        city: String,
        area: String
    },
    deliveryShift: {
        type: String,
        required: true
    },
    estimatedDelivery: {
        type: Date
    },
    deliveredAt: {
        type: Date
    },
    numberOfPackages: {
        type: Number,
        default: 0
    },
    bilty: {
        biltyNumber: String,
        generatedAt: Date,
        numberOfPackages: Number,
        items: [{
            name: String,
            quantity: Number,
            unit: String
        }],
        totalWeight: String,
        fromFranchise: String,
        toCustomer: String,
        toAddress: String,
        deliveryPartner: String,
        vehicleNumber: String,
        vehicleType: String
    },
    razorpayOrderId: String,
    razorpayPaymentId: String
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
