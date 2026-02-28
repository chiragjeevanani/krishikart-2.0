import Delivery from "../models/delivery.js";
import Order from "../models/order.js";
import DeliveryCodRemittance from "../models/deliveryCodRemittance.js";
import { handleResponse } from "../utils/helper.js";

/**
 * @desc Get All Active Delivery Partners
 * @route GET /delivery/partners
 * @access Private (Franchise/Admin)
 */
export const getAllDeliveryPartners = async (req, res) => {
    try {
        const partners = await Delivery.find({ status: 'active', isVerified: true })
            .select('fullName mobile vehicleNumber vehicleType');

        return handleResponse(res, 200, "Delivery partners fetched successfully", partners);
    } catch (err) {
        console.error("Get Delivery Partners Error:", err);
        return handleResponse(res, 500, "Internal server error");
    }
};

export const getMyCodSummary = async (req, res) => {
    try {
        const deliveryId = req.delivery?._id;
        if (!deliveryId) return handleResponse(res, 401, "Unauthorized");

        const pendingOrders = await Order.find({
            paymentMethod: "COD",
            "codTracking.isCollected": true,
            "codTracking.collectedByDeliveryId": deliveryId,
            "codTracking.remittanceStatus": "pending"
        }).select("_id totalAmount createdAt codTracking");

        const submittedRemittances = await DeliveryCodRemittance.find({
            deliveryPartnerId: deliveryId,
            status: "submitted"
        }).select("amount");

        const verifiedRemittances = await DeliveryCodRemittance.find({
            deliveryPartnerId: deliveryId,
            status: "verified"
        }).select("amount");

        const pendingAmount = pendingOrders.reduce((sum, o) => sum + Number(o.codTracking?.collectedAmount || o.totalAmount || 0), 0);
        const submittedAmount = submittedRemittances.reduce((sum, r) => sum + Number(r.amount || 0), 0);
        const verifiedAmount = verifiedRemittances.reduce((sum, r) => sum + Number(r.amount || 0), 0);

        return handleResponse(res, 200, "COD summary fetched", {
            pendingOrders: pendingOrders.map((o) => ({
                orderId: o._id,
                amount: Number(o.codTracking?.collectedAmount || o.totalAmount || 0),
                collectedAt: o.codTracking?.collectedAt || o.createdAt
            })),
            totals: {
                pendingAmount: Number(pendingAmount.toFixed(2)),
                submittedAmount: Number(submittedAmount.toFixed(2)),
                verifiedAmount: Number(verifiedAmount.toFixed(2))
            }
        });
    } catch (err) {
        console.error("Get COD summary error:", err);
        return handleResponse(res, 500, "Internal server error");
    }
};

export const submitCodRemittance = async (req, res) => {
    try {
        const deliveryId = req.delivery?._id;
        if (!deliveryId) return handleResponse(res, 401, "Unauthorized");

        const { orderIds, paymentMethod = "cash", referenceNo = "", note = "" } = req.body;

        let targetOrderIds = Array.isArray(orderIds) ? orderIds : [];

        if (!targetOrderIds.length) {
            const pending = await Order.find({
                paymentMethod: "COD",
                "codTracking.isCollected": true,
                "codTracking.collectedByDeliveryId": deliveryId,
                "codTracking.remittanceStatus": "pending"
            }).select("_id");
            targetOrderIds = pending.map((o) => o._id);
        }

        if (!targetOrderIds.length) {
            return handleResponse(res, 400, "No pending COD orders to remit");
        }

        const orders = await Order.find({
            _id: { $in: targetOrderIds },
            paymentMethod: "COD",
            "codTracking.isCollected": true,
            "codTracking.collectedByDeliveryId": deliveryId,
            "codTracking.remittanceStatus": "pending"
        }).select("_id totalAmount codTracking");

        if (!orders.length) {
            return handleResponse(res, 400, "No valid COD orders found for remittance");
        }

        const amount = orders.reduce((sum, o) => sum + Number(o.codTracking?.collectedAmount || o.totalAmount || 0), 0);

        const remittance = await DeliveryCodRemittance.create({
            deliveryPartnerId: deliveryId,
            orderIds: orders.map((o) => o._id),
            amount: Number(amount.toFixed(2)),
            paymentMethod,
            referenceNo: String(referenceNo || ""),
            note: String(note || ""),
            status: "submitted"
        });

        await Order.updateMany(
            { _id: { $in: orders.map((o) => o._id) } },
            {
                $set: {
                    "codTracking.remittanceStatus": "submitted",
                    "codTracking.remittanceId": remittance._id,
                    "codTracking.remittedAt": new Date()
                }
            }
        );

        return handleResponse(res, 201, "COD remittance submitted successfully", remittance);
    } catch (err) {
        console.error("Submit COD remittance error:", err);
        return handleResponse(res, 500, "Internal server error");
    }
};

export const getMyCodRemittances = async (req, res) => {
    try {
        const deliveryId = req.delivery?._id;
        if (!deliveryId) return handleResponse(res, 401, "Unauthorized");

        const remittances = await DeliveryCodRemittance.find({ deliveryPartnerId: deliveryId })
            .sort({ createdAt: -1 })
            .limit(50);

        return handleResponse(res, 200, "COD remittance history fetched", remittances);
    } catch (err) {
        console.error("Get COD remittance history error:", err);
        return handleResponse(res, 500, "Internal server error");
    }
};
