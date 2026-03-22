import razorpay from "../utils/razorpay.js";
import crypto from "crypto";
import handleResponse from "../utils/helper.js";
import Order from "../models/order.js";
import Cart from "../models/cart.js";
import mongoose from "mongoose";
import {
    computeSplitCheckoutPayload,
    resolveCheckoutCoordinates,
} from "../utils/checkoutOrderSplit.js";
import { assignOrderToFranchise } from "../utils/assignment.js";

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

        if (!orderData.shippingAddress || !orderData.paymentMethod || !orderData.deliveryShift) {
            console.error("Incomplete orderData:", {
                hasShippingAddress: !!orderData.shippingAddress,
                hasPaymentMethod: !!orderData.paymentMethod,
                hasDeliveryShift: !!orderData.deliveryShift,
                orderData
            });
            return handleResponse(res, 400, "Missing shipping address, payment method, or delivery shift");
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
        const { shippingAddress, shippingLocation, paymentMethod, deliveryShift } = orderData;

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

        const resolvedLocation = await resolveCheckoutCoordinates(
            shippingAddress,
            shippingLocation,
        );

        if (!resolvedLocation) {
            return handleResponse(
                res,
                400,
                "Valid delivery location is required. Please pick your location on the map and try again.",
            );
        }

        const split = await computeSplitCheckoutPayload({
            cart,
            userId,
            couponCode: orderData.couponCode || "",
            resolvedLocation,
        });

        if (!split.ok) {
            return handleResponse(res, split.status, split.message);
        }

        const {
            userCoords,
            computedGroups,
            grandTotal,
            appliedCouponCode,
            couponToIncrement,
            orderGroupId,
        } = split.payload;

        console.log("Split checkout totals:", { slices: computedGroups.length, grandTotal });

        const createdOrders = [];
        for (const g of computedGroups) {
            let fulfillmentCategoryId = null;
            try {
                fulfillmentCategoryId = new mongoose.Types.ObjectId(g.categoryId);
            } catch {
                fulfillmentCategoryId = null;
            }

            const newOrder = new Order({
                userId,
                franchiseId: null,
                items: g.items,
                subtotal: g.subtotal,
                deliveryFee: g.deliveryFee,
                tax: g.tax,
                totalAmount: g.totalAmount,
                paymentMethod,
                couponCode: appliedCouponCode,
                discountAmount: g.discountAmount,
                paymentStatus: "Completed",
                orderStatus: "Placed",
                shippingAddress,
                shippingLocation: userCoords,
                deliveryShift,
                orderGroupId,
                fulfillmentCategoryId,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
            });

            await newOrder.save();
            createdOrders.push(newOrder);
            console.log("Order saved successfully, ID:", newOrder._id);

            try {
                await assignOrderToFranchise(newOrder._id);
            } catch (assignErr) {
                console.error("[VerifyPayment] Auto-assignment failed:", assignErr);
            }
        }

        if (couponToIncrement) {
            couponToIncrement.timesUsed += 1;
            await couponToIncrement.save();
        }

        cart.items = [];
        await cart.save();
        console.log("Cart cleared");

        console.log("=== Payment Verification Completed Successfully ===");

        const payload =
            createdOrders.length === 1
                ? {
                      order: createdOrders[0],
                      orders: createdOrders,
                      orderGroupId,
                      grandTotal,
                  }
                : { orders: createdOrders, orderGroupId, grandTotal };

        return handleResponse(res, 201, "Order placed and payment verified", payload);

    } catch (error) {
        console.error("=== Payment Verification Failed ===");
        console.error("Error type:", error.name);
        console.error("Error message:", error.message);
        console.error("Stack trace:", error.stack);

        // Send detailed error message to frontend
        const errorMessage = error.message || "Payment verification failed";
        if (error.name === "ValidationError") {
            return handleResponse(res, 400, `Verification error: ${errorMessage}`);
        }
        return handleResponse(res, 500, `Verification error: ${errorMessage}`);
    }
};
