import mongoose from "mongoose";
import Product from "../models/product.js";
import ProcurementRequest from "../models/procurementRequest.js";
import Franchise from "../models/franchise.js";
import User from "../models/user.js";
import Inventory from "../models/inventory.js";
import handleResponse from "../utils/helper.js";

// Get vendor assignments (Vendor)
export const getVendorAssignments = async (req, res) => {
    try {
        const vendorId = req.vendor._id.toString();
        console.log(`Fetching assignments for Vendor: ${vendorId}`);

        let assignments = await ProcurementRequest.find({ assignedVendorId: vendorId })
            .populate("franchiseId", "shopName ownerName mobile cityArea address")
            .sort({ createdAt: -1 })
            .lean(); // Use lean to modify the object

        console.log(`Found ${assignments.length} assignments for vendor ${vendorId}`);

        // Manually populate images for items
        if (assignments && Array.isArray(assignments)) {
            for (let assignment of assignments) {
                if (!assignment.items) continue;
                for (let item of assignment.items) {
                    try {
                        if (!item.image && item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
                            const product = await Product.findById(item.productId).select('primaryImage images');
                            if (product) {
                                item.image = product.primaryImage || (product.images && product.images[0]) || "";
                            }
                        }
                    } catch (itemErr) {
                        console.error("[VENDOR_ASSIGNMENTS] Item image pop error:", itemErr.message);
                    }
                }
            }
        }

        return handleResponse(res, 200, "Vendor assignments fetched", assignments);
    } catch (error) {
        console.error("Get vendor assignments error:", error);
        return handleResponse(res, 500, error.message || "Server error");
    }
};

// Get single assignment details (Vendor)
export const getVendorProcurementById = async (req, res) => {
    try {
        const { requestId } = req.params;
        const vendorId = req.vendor._id.toString();

        const request = await ProcurementRequest.findById(requestId)
            .populate("franchiseId", "shopName ownerName mobile cityArea address")
            .lean();

        if (!request) {
            return handleResponse(res, 404, "Request not found");
        }

        if (request.assignedVendorId?.toString() !== vendorId) {
            return handleResponse(res, 403, "Not authorized to view this request");
        }

        // Manually populate images for items
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

        return handleResponse(res, 200, "Procurement request details fetched", request);
    } catch (error) {
        console.error("Get vendor procurement by id error:", error);
        return handleResponse(res, 500, error.message || "Server error");
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

        // Verify assignment
        const assignedVendorId = request.assignedVendorId ? request.assignedVendorId.toString() : "";
        const currentVendorId = req.vendor._id.toString();

        if (assignedVendorId !== currentVendorId) {
            return handleResponse(res, 403, "Not authorized to submit quotation for this request");
        }
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

        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            return handleResponse(res, 400, "Invalid request ID format");
        }

        const request = await ProcurementRequest.findById(requestId);
        if (!request) {
            return handleResponse(res, 404, "Request not found");
        }

        // Verify assignment - handle potential null or mismatch safely
        const assignedVendorId = request.assignedVendorId ? request.assignedVendorId.toString() : "";
        const currentVendorId = req.vendor._id.toString();

        if (assignedVendorId !== currentVendorId) {
            return handleResponse(res, 403, "Not authorized to update this request. Assigned: " + assignedVendorId + " Current: " + currentVendorId);
        }

        request.status = status;

        if (weight !== undefined) {
            request.actualWeight = Number(weight);
        }

        // If dispatching/marking as ready_for_pickup, generate a mock invoice
        if (status === 'ready_for_pickup') {
            try {
                const invCount = await ProcurementRequest.countDocuments({ "invoice.invoiceNumber": { $exists: true } });
                request.invoice = {
                    invoiceNumber: `INV-${new Date().getFullYear()}-${(invCount + 1).toString().padStart(4, '0')}`,
                    invoiceDate: new Date(),
                    generatedAt: new Date(),
                    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" // Placeholder PDF
                };
            } catch (invErr) {
                console.error("Invoice generation error:", invErr);
                // Continue anyway or handle
            }
        }

        await request.save();

        return handleResponse(res, 200, "Status updated successfully", request);
    } catch (error) {
        console.error("Vendor update status error DETAILS:", error);
        return handleResponse(res, 500, error.message || "Server error");
    }
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

        console.log(`Admin updating request ${requestId}. Status: ${status}, Vendor: ${vendorId}`);

        const request = await ProcurementRequest.findById(requestId);
        if (!request) {
            return handleResponse(res, 404, "Procurement request not found");
        }

        if (status) request.status = status;
        if (vendorId) request.assignedVendorId = vendorId;
        if (adminId) request.adminId = adminId;

        await request.save();
        console.log(`Request ${requestId} saved. Assigned Vendor: ${request.assignedVendorId}`);

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
        if (!req.vendor || !req.vendor._id) {
            return handleResponse(res, 401, "Vendor identification missing");
        }

        const vendorId = req.vendor._id.toString();
        console.log(`[VENDOR_API] Fetching active dispatches for vendor: ${vendorId}`);

        // Fetch orders where status is approved, preparing, or ready for pickup (active cycle)
        const assignments = await ProcurementRequest.find({
            assignedVendorId: vendorId,
            status: { $in: ['approved', 'preparing', 'ready_for_pickup'] }
        })
            .populate("franchiseId", "shopName ownerName mobile cityArea address")
            .sort({ createdAt: -1 })
            .lean();

        console.log(`[VENDOR_API] Found ${assignments?.length || 0} active assignments`);

        // Manually populate images for items
        if (assignments && assignments.length > 0) {
            for (let assignment of assignments) {
                if (!assignment.items || !Array.isArray(assignment.items)) continue;

                for (let item of assignment.items) {
                    try {
                        // Check if we need to populate image and if productId is a valid ObjectId
                        if (!item.image && item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
                            const product = await Product.findById(item.productId).select('primaryImage images');
                            if (product) {
                                item.image = product.primaryImage || (product.images && product.images[0]) || "";
                            }
                        }
                    } catch (itemErr) {
                        console.error("[VENDOR_API] Item image population error:", itemErr.message);
                    }
                }
            }
        }

        return handleResponse(res, 200, "Active dispatch orders fetched", assignments);
    } catch (error) {
        console.error("[VENDOR_API_ERROR] Detail:", error);
        return handleResponse(res, 500, `Server error: ${error.message}`);
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
// Franchise confirm receipt
export const franchiseConfirmReceipt = async (req, res) => {
    try {
        const { requestId } = req.params;
        const franchiseId = req.franchise._id;

        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            return handleResponse(res, 400, "Invalid request ID format");
        }

        const request = await ProcurementRequest.findById(requestId);
        if (!request) {
            return handleResponse(res, 404, "Request not found");
        }

        // Verify franchise ownership
        if (request.franchiseId.toString() !== franchiseId.toString()) {
            return handleResponse(res, 403, "Not authorized to update this request");
        }

        const { items: auditData } = req.body; // Expecting [{ productId: string, receivedQuantity: number, damagedQuantity: number }]

        request.status = 'completed';

        // Update Request with Audit Data
        if (auditData && Array.isArray(auditData)) {
            for (const auditItem of auditData) {
                const itemInRequest = request.items.find(i =>
                    (i._id?.toString() === auditItem.productId) ||
                    (i.productId === auditItem.productId)
                );
                if (itemInRequest) {
                    itemInRequest.receivedQuantity = Number(auditItem.receivedQuantity) || 0;
                    itemInRequest.damagedQuantity = Number(auditItem.damagedQuantity) || 0;
                }
            }
        }

        await request.save();

        // Update Franchise Inventory
        try {
            let inventory = await Inventory.findOne({ franchiseId });

            if (!inventory) {
                // Initialize inventory if it doesn't exist
                inventory = new Inventory({ franchiseId, items: [] });
            }

            // Sync items from request to inventory
            for (const reqItem of request.items) {
                const prodId = reqItem.productId;
                if (!mongoose.Types.ObjectId.isValid(prodId)) continue;

                // Use the reported received quantity for inventory update
                // If not reported (fallback), use the original requested quantity
                const quantityToAdd = reqItem.receivedQuantity !== undefined ?
                    Number(reqItem.receivedQuantity) :
                    Number(reqItem.quantity);

                const existingItem = inventory.items.find(i => i.productId.toString() === prodId.toString());
                if (existingItem) {
                    existingItem.currentStock += quantityToAdd;
                    existingItem.lastUpdated = new Date();
                } else {
                    inventory.items.push({
                        productId: prodId,
                        currentStock: quantityToAdd,
                        lastUpdated: new Date()
                    });
                }
            }

            await inventory.save();
            console.log(`Inventory updated for franchise: ${franchiseId} based on audit results`);
        } catch (invErr) {
            console.error("Critical: Stock sync failed during receipt confirmation:", invErr);
        }

        return handleResponse(res, 200, "Goods received and stock updated successfully", request);
    } catch (error) {
        console.error("Franchise confirm receipt error:", error);
        return handleResponse(res, 500, "Server error");
    }
};

// NEW: Create procurement from order shortages (Admin)
export const createProcurementFromOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { vendorId } = req.body;
        const adminId = req.masteradmin?._id;

        const Order = (await import('../models/order.js')).default;
        const order = await Order.findById(orderId);

        if (!order) {
            return handleResponse(res, 404, "Order not found");
        }

        const shortageItems = order.items.filter(item => item.isShortage);
        if (shortageItems.length === 0) {
            return handleResponse(res, 400, "No items in this order require procurement");
        }

        const procurementRequest = new ProcurementRequest({
            franchiseId: order.franchiseId,
            items: shortageItems.map(item => ({
                productId: item.productId,
                name: item.name,
                quantity: item.shortageQty,
                unit: item.unit,
                price: item.price,
                image: item.image
            })),
            totalEstimatedAmount: shortageItems.reduce((acc, item) => acc + (item.price * item.shortageQty), 0),
            status: "assigned",
            assignedVendorId: vendorId,
            adminId: adminId
        });

        await procurementRequest.save();

        // Optional: Update order to indicate procurement has started
        // order.procurementId = procurementRequest._id;
        // await order.save();

        return handleResponse(res, 201, "Procurement request created and assigned to vendor", procurementRequest);
    } catch (error) {
        console.error("Create procurement from order error:", error);
        return handleResponse(res, 500, "Server error: " + error.message);
    }
};
