import razorpay from "../utils/razorpay.js";
import crypto from "crypto";
import handleResponse from "../utils/helper.js";
import Order from "../models/order.js";
import Cart from "../models/cart.js";
import User from "../models/user.js";
import Product from "../models/product.js";
import Franchise from "../models/franchise.js";
import { geocodeAddress, getDistance } from "../utils/geo.js";

/**
 * Helper to calculate price based on quantity and bulk pricing rules (Copied from order controller)
 */
const calculateItemPrice = (product, quantity) => {
    let price = product.price;
    let isBulkRate = false;

    if (product.bulkPricing && product.bulkPricing.length > 0) {
        const sortedBulk = [...product.bulkPricing].sort((a, b) => b.minQty - a.minQty);
        const applicableBulk = sortedBulk.find(bp => quantity >= bp.minQty);
        if (applicableBulk) {
            price = applicableBulk.price;
            isBulkRate = true;
        }
    }
    return { price, isBulkRate };
};

export const createRazorpayOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount } = req.body; // Amount in INR

        if (!amount) {
            return handleResponse(res, 400, "Amount is required");
        }

        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        return handleResponse(res, 200, "Razorpay order created", order);
    } catch (error) {
        console.error("Razorpay create order error:", error);
        return handleResponse(res, 500, "Payment initialization failed");
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderData
        } = req.body;

        const userId = req.user.id;

        // 0. Diagnostic Logging
        console.log("--- Payment Verification Start ---");
        console.log("User ID:", userId);
        console.log("Rzp Order ID:", razorpay_order_id);
        console.log("Rzp Payment ID:", razorpay_payment_id);
        console.log("Rzp Signature:", !!razorpay_signature);
        console.log("Order Data:", JSON.stringify(orderData, null, 2));

        // Input Validation
        console.log("Validating request fields...");
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            console.error("Missing payment credentials:", {
                hasOrderId: !!razorpay_order_id,
                hasPaymentId: !!razorpay_payment_id,
                hasSignature: !!razorpay_signature
            });
            return handleResponse(res, 400, "Missing payment credentials");
        }

        if (!orderData) {
            console.error("Missing orderData object");
            return handleResponse(res, 400, "Missing order information");
        }

        if (!orderData.shippingAddress || !orderData.paymentMethod) {
            console.error("Incomplete orderData:", {
                hasShippingAddress: !!orderData.shippingAddress,
                hasPaymentMethod: !!orderData.paymentMethod,
                orderData
            });
            return handleResponse(res, 400, "Missing shipping address or payment method");
        }

        console.log("All fields validated successfully");

        // 1. Verify Signature
        console.log("Verifying payment signature...");
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature !== expectedSign) {
            console.error("Signature mismatch:", {
                received: razorpay_signature,
                expected: expectedSign
            });
            return handleResponse(res, 400, "Invalid payment signature");
        }

        console.log("Signature verified successfully");

        // 2. Original Order Logic (Create the order in DB after payment)
        const { shippingAddress, paymentMethod } = orderData;

        // Get User Cart
        console.log("Fetching user cart for userId:", userId);
        const cart = await Cart.findOne({ userId }).populate('items.productId');

        if (!cart) {
            console.error("Cart not found for userId:", userId);
            return handleResponse(res, 400, "Cart not found. Please add items to cart and try again.");
        }

        if (cart.items.length === 0) {
            console.error("Cart is empty for userId:", userId);
            return handleResponse(res, 400, "Your cart is empty. Items may have been removed during payment.");
        }

        console.log(`Cart found with ${cart.items.length} items`);

        const user = await User.findById(userId);

        let subtotal = 0;
        const orderItems = [];

        for (const item of cart.items) {
            const product = item.productId;
            if (!product || product.status !== 'active') {
                console.error("Inactive product in cart:", product?.name || 'Unknown');
                return handleResponse(res, 400, `Product ${product?.name || 'Unknown'} is no longer available`);
            }

            const { price, isBulkRate } = calculateItemPrice(product, item.quantity);
            const itemSubtotal = price * item.quantity;

            orderItems.push({
                productId: product._id,
                name: product.name,
                image: product.primaryImage,
                quantity: item.quantity,
                unit: product.unit,
                price: price,
                subtotal: itemSubtotal,
                isBulkRate
            });

            subtotal += itemSubtotal;
        }

        const deliveryFee = subtotal > 1000 ? 0 : 50;
        const tax = Math.round(subtotal * 0.05);
        const totalAmount = subtotal + deliveryFee + tax;

        console.log("Order totals calculated:", { subtotal, deliveryFee, tax, totalAmount });

        // 2.5 Auto Franchise Assignment
        let assignedFranchiseId = null;
        let userCoords = null;
        console.log('Attempting auto-franchise assignment...');
        try {
            userCoords = await geocodeAddress(shippingAddress);
            if (userCoords) {
                const activeFranchises = await Franchise.find({
                    status: 'active',
                    'location.lat': { $ne: null },
                    'location.lng': { $ne: null }
                });

                let minDistance = Infinity;
                for (const franchise of activeFranchises) {
                    const dist = getDistance(
                        userCoords.lat, userCoords.lng,
                        franchise.location.lat, franchise.location.lng
                    );
                    if (dist < minDistance) {
                        minDistance = dist;
                        assignedFranchiseId = franchise._id;
                    }
                }
            }
        } catch (geoErr) {
            console.error("Auto-assignment error:", geoErr);
        }

        const franchiseId = assignedFranchiseId;
        if (franchiseId) {
            console.log(`Order auto-assigned to franchise ID: ${franchiseId}`);
        } else {
            console.log('=== Broadcast Payment Order ===');
            console.log('Payment order will be broadcast to ALL active franchises');
        }

        console.log("Creating order in database...");
        const newOrder = new Order({
            userId,
            franchiseId,
            items: orderItems,
            subtotal,
            deliveryFee,
            tax,
            totalAmount,
            paymentMethod,
            paymentStatus: 'Completed',
            orderStatus: 'Placed',
            shippingAddress,
            shippingLocation: userCoords,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id
        });

        await newOrder.save();
        console.log("Order saved successfully, ID:", newOrder._id);

        // Clear Cart
        cart.items = [];
        await cart.save();
        console.log("Cart cleared");

        console.log("=== Payment Verification Completed Successfully ===");
        return handleResponse(res, 201, "Order placed and payment verified", newOrder);

    } catch (error) {
        console.error("=== Payment Verification Failed ===");
        console.error("Error type:", error.name);
        console.error("Error message:", error.message);
        console.error("Stack trace:", error.stack);

        // Send detailed error message to frontend
        const errorMessage = error.message || "Payment verification failed";
        return handleResponse(res, 500, `Verification error: ${errorMessage}`);
    }
};
