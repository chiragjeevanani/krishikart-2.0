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

const returnItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: String,
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    unit: String
}, { _id: false });

const returnRequestSchema = new mongoose.Schema({
    items: {
        type: [returnItemSchema],
        default: []
    },
    reason: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'pickup_assigned', 'picked_up', 'completed'],
        default: 'pending'
    },
    reviewedByFranchiseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Franchise',
        default: null
    },
    franchiseReviewReason: {
        type: String,
        default: ''
    },
    reviewedAt: {
        type: Date,
        default: null
    },
    pickupDeliveryPartnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Delivery',
        default: null
    },
    pickupAssignedAt: {
        type: Date,
        default: null
    },
    pickupPickedAt: {
        type: Date,
        default: null
    },
    pickupCompletedAt: {
        type: Date,
        default: null
    },
    requestedAt: {
        type: Date,
        default: Date.now
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
<<<<<<< HEAD
    returnRequests: {
        type: [returnRequestSchema],
        default: []
=======
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
>>>>>>> 1cafd49630f6891ef7d5ae51254168387bcc9878
    },
    razorpayOrderId: String,
    razorpayPaymentId: String
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
