import mongoose from "mongoose";
import Product from "../models/product.js";
import ProcurementRequest from "../models/procurementRequest.js";
import Franchise from "../models/franchise.js";
import User from "../models/user.js";

// Get vendor assignments (Vendor)
export const getVendorAssignments = async (req, res) => {
    try {
        const vendorId = req.vendor._id.toString();
        let assignments = await ProcurementRequest.find({ assignedVendorId: vendorId })
            .populate("franchiseId", "shopName ownerName mobile cityArea address")
            .sort({ createdAt: -1 })
            .lean(); // Use lean to modify the object

        // Manually populate images for items
        for (let assignment of assignments) {
            for (let item of assignment.items) {
                if (!item.image && item.productId) {
                    if (mongoose.Types.ObjectId.isValid(item.productId)) {
                        const product = await Product.findById(item.productId).select('primaryImage images');
                        if (product) {
                            item.image = product.primaryImage || (product.images && product.images[0]) || "";
                        }
                    }
                }
            }
        }

        return handleResponse(res, 200, "Vendor assignments fetched", assignments);
    } catch (error) {
        console.error("Get vendor assignments error:", error);
        return handleResponse(res, 500, "Server error");
    }
};

// Vendor submit quotation
export const vendorSubmitQuotation = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { items } = req.body; // Array of { productId, quotedPrice } or index-based

        const request = await ProcurementRequest.findById(requestId);
        if (!request) {
            return handleResponse(res, 404, "Request not found");
        }

        // Update items with quoted prices
        let totalQuoted = 0;
        if (items && Array.isArray(items)) {
            // Assume items in body match items in request by productId or _id
            request.items.forEach(reqItem => {
                const submittedItem = items.find(i =>
                    (i._id && i._id === reqItem._id.toString()) ||
                    (i.productId === reqItem.productId)
                );
                if (submittedItem) {
                    reqItem.quotedPrice = Number(submittedItem.quotedPrice) || 0;
                }
                totalQuoted += (reqItem.quotedPrice || 0) * reqItem.quantity;
            });
        }

        request.totalQuotedAmount = totalQuoted;
        request.status = 'quoted';
        await request.save();

        return handleResponse(res, 200, "Quotation submitted successfully", request);
    } catch (error) {
        console.error("Vendor submit quotation error:", error);
        return handleResponse(res, 500, "Server error");
    }
};

// Vendor update status and finalize dispatch
export const vendorUpdateStatus = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, weight } = req.body;

        const request = await ProcurementRequest.findById(requestId);
        if (!request) {
            return handleResponse(res, 404, "Request not found");
        }

        // Verify assignment
        if (request.assignedVendorId.toString() !== req.vendor._id.toString()) {
            return handleResponse(res, 403, "Not authorized to update this request");
        }

        request.status = status;

        if (weight) {
            request.actualWeight = weight;
        }

        // If dispatching/marking as ready_for_pickup, generate a mock invoice
        if (status === 'ready_for_pickup') {
            const invCount = await ProcurementRequest.countDocuments({ "invoice.invoiceNumber": { $exists: true } });
            request.invoice = {
                invoiceNumber: `INV-${new Date().getFullYear()}-${(invCount + 1).toString().padStart(4, '0')}`,
                invoiceDate: new Date(),
                generatedAt: new Date(),
                fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" // Placeholder PDF
            };
        }

        await request.save();

        return handleResponse(res, 200, "Status updated successfully", request);
    } catch (error) {
        console.error("Vendor update status error:", error);
        return handleResponse(res, 500, "Server error");
    }
};

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

        let requests = await ProcurementRequest.find(query)
            .populate("franchiseId", "shopName ownerName mobile cityArea")
            .sort({ createdAt: -1 })
            .lean();

        // Manually populate images for items
        for (let request of requests) {
            for (let item of request.items) {
                if (!item.image && item.productId) {
                    if (mongoose.Types.ObjectId.isValid(item.productId)) {
                        const product = await Product.findById(item.productId).select('primaryImage images');
                        if (product) {
                            item.image = product.primaryImage || (product.images && product.images[0]) || "";
                        }
                    }
                }
            }
        }

        return handleResponse(res, 200, "All procurement requests fetched", requests);

    } catch (error) {
        console.error("Get all procurement requests error:", error);
        return handleResponse(res, 500, "Server error");
    }
};

// Get approved/active dispatch orders (Vendor)
export const getVendorActiveDispatch = async (req, res) => {
    try {
        const vendorId = req.vendor._id.toString();
        // Fetch orders where status is approved or preparing
        let assignments = await ProcurementRequest.find({
            assignedVendorId: vendorId,
            status: { $in: ['approved', 'preparing'] }
        })
            .populate("franchiseId", "shopName ownerName mobile cityArea address")
            .sort({ createdAt: -1 })
            .lean();

        // Manually populate images for items
        for (let assignment of assignments) {
            for (let item of assignment.items) {
                if (!item.image && item.productId) {
                    if (mongoose.Types.ObjectId.isValid(item.productId)) {
                        const product = await Product.findById(item.productId).select('primaryImage images');
                        if (product) {
                            item.image = product.primaryImage || (product.images && product.images[0]) || "";
                        }
                    }
                }
            }
        }

        return handleResponse(res, 200, "Active dispatch orders fetched", assignments);
    } catch (error) {
        console.error("Get active dispatch error:", error);
        return handleResponse(res, 500, "Server error");
    }
};

// Get my requests (Franchise)
export const getMyProcurementRequests = async (req, res) => {
    try {
        const franchiseId = req.franchise._id;
        let requests = await ProcurementRequest.find({ franchiseId })
            .sort({ createdAt: -1 })
            .lean();

        // Manually populate images for items
        for (let request of requests) {
            for (let item of request.items) {
                if (!item.image && item.productId) {
                    if (mongoose.Types.ObjectId.isValid(item.productId)) {
                        const product = await Product.findById(item.productId).select('primaryImage images');
                        if (product) {
                            item.image = product.primaryImage || (product.images && product.images[0]) || "";
                        }
                    }
                }
            }
        }

        return handleResponse(res, 200, "My procurement requests fetched", requests);
    } catch (error) {
        console.error("Get my procurement requests error:", error);
        return handleResponse(res, 500, "Server error");
    }
};

// Get Vendor Reports (Admin)
export const getVendorReports = async (req, res) => {
    try {
        // Fetch all requests that have an invoice/are dispatched
        const reports = await ProcurementRequest.find({
            status: { $in: ['ready_for_pickup', 'completed'] },
            "invoice.invoiceNumber": { $exists: true }
        })
            .populate("franchiseId", "shopName ownerName mobile cityArea")
            .sort({ updatedAt: -1 })
            .lean();

        return handleResponse(res, 200, "Vendor reports fetched", reports);
    } catch (error) {
        console.error("Get vendor reports error:", error);
        return handleResponse(res, 500, "Server error");
    }
};
