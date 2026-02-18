import ProcurementRequest from "../models/procurementRequest.js";
import Franchise from "../models/franchise.js";
import User from "../models/user.js";

// Helper for responses
const handleResponse = (res, statusCode, message, data = {}) => {
    const success = statusCode >= 200 && statusCode < 300;
    return res.status(statusCode).json({
        success,
        error: !success,
        message,
        results: data,
    });
};

// Create a new procurement request (Franchise)
export const createProcurementRequest = async (req, res) => {
    try {
        const franchiseId = req.franchise._id; // Extracted from middleware
        const { items, totalEstimatedAmount } = req.body;

        if (!items || items.length === 0) {
            return handleResponse(res, 400, "Items array is required");
        }

        const procurementRequest = new ProcurementRequest({
            franchiseId,
            items: items.map(item => ({
                productId: item.id || item.productId,
                name: item.name,
                quantity: item.qty || item.quantity,
                unit: item.unit,
                price: item.price
            })),
            totalEstimatedAmount,
            status: "pending_assignment"
        });

        await procurementRequest.save();

        return handleResponse(res, 201, "Procurement request submitted successfully", procurementRequest);
    } catch (error) {
        console.error("Create procurement request error:", error);
        return handleResponse(res, 500, "Server error");
    }
};

// Update status (Admin) - Assign Vendor
export const adminUpdateProcurementRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, vendorId, adminId } = req.body;

        const request = await ProcurementRequest.findById(requestId);
        if (!request) {
            return handleResponse(res, 404, "Procurement request not found");
        }

        if (status) request.status = status;
        if (vendorId) request.assignedVendorId = vendorId;
        if (adminId) request.adminId = adminId;

        await request.save();

        return handleResponse(res, 200, "Procurement request updated successfully", request);
    } catch (error) {
        console.error("Update procurement request error:", error);
        return handleResponse(res, 500, "Server error");
    }
};

// Get all requests (Admin)
export const getAllProcurementRequests = async (req, res) => {
    try {
        // Fetch all pending requests first, or filter by query params
        const { status } = req.query;
        const query = {};
        if (status) query.status = status;

        const requests = await ProcurementRequest.find(query)
            .populate("franchiseId", "shopName ownerName mobile cityArea")
            .sort({ createdAt: -1 });

        return handleResponse(res, 200, "All procurement requests fetched", requests);

    } catch (error) {
        console.error("Get all procurement requests error:", error);
        return handleResponse(res, 500, "Server error");
    }
};

// Get my requests (Franchise)
export const getMyProcurementRequests = async (req, res) => {
    try {
        const franchiseId = req.franchise._id;
        const requests = await ProcurementRequest.find({ franchiseId }).sort({ createdAt: -1 });
        return handleResponse(res, 200, "My procurement requests fetched", requests);
    } catch (error) {
        console.error("Get my procurement requests error:", error);
        return handleResponse(res, 500, "Server error");
    }
};
