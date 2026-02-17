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
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    franchiseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Franchise',
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
        enum: ['Pending', 'Placed', 'Confirmed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    shippingAddress: {
        type: String,
        required: true
    },
    estimatedDelivery: {
        type: Date
    },
    deliveredAt: {
        type: Date
    },
    razorpayOrderId: String,
    razorpayPaymentId: String
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
