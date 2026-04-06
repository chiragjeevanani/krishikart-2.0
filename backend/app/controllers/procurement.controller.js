import mongoose from "mongoose";
import Product from "../models/product.js";
import ProcurementRequest from "../models/procurementRequest.js";
import Franchise from "../models/franchise.js";
import User from "../models/user.js";
import Order from "../models/order.js";
import Inventory from "../models/inventory.js";
import VendorInventory from "../models/vendorInventory.js";
import Vendor from "../models/vendor.js";
import handleResponse from "../utils/helper.js";
import { emitToVendor, emitToAdmin, emitToFranchise } from "../lib/socket.js";
import { sendNotificationToUser } from "../utils/pushNotificationHelper.js";
import { createAdminNotification } from "../utils/adminNotification.js";

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
                    const price = Number(submittedItem.quotedPrice) || 0;
                    reqItem.quotedPrice = price;
                    reqItem.originalQuotedPrice = price;
                }
                totalQuoted += (reqItem.quotedPrice || 0) * reqItem.quantity;
            });
        }

        request.totalQuotedAmount = totalQuoted;
        request.vendorQuoteTotal = totalQuoted;
        request.status = 'quoted';
        await request.save();

        // Socket Notifications
        emitToAdmin('procurement_quote_received', {
            requestId: request._id,
            message: `A new quote from vendor for procurement #${request._id.toString().slice(-6)}`
        });
        await createAdminNotification({
            type: 'procurement_quote_received',
            title: 'Vendor Quote Received',
            message: `A vendor submitted a quote for procurement #${request._id.toString().slice(-6)}.`,
            link: '/masteradmin/quotations',
            meta: {
                requestId: request._id.toString(),
                orderId: request.orderId?.toString?.() || '',
            }
        });

        // Update Order if exists
        if (request.orderId) {
            await Order.findByIdAndUpdate(request.orderId, {
                $push: {
                    statusHistory: {
                        status: 'Procuring',
                        updatedAt: new Date(),
                        updatedBy: 'vendor',
                        message: 'Vendor has submitted a quotation for out-of-stock items.'
                    }
                }
            });
        }

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
        const { status, weight, itemUpdates } = req.body; // itemUpdates: [{ productId, dispatchedQuantity }]

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
            return handleResponse(res, 403, "Not authorized to update this request");
        }

        // Update items if provided
        if (itemUpdates && Array.isArray(itemUpdates)) {
            const residualItems = [];
            const dispatchedItems = [];

            request.items.forEach(item => {
                const update = itemUpdates.find(u => u.productId?.toString() === item.productId?.toString());
                if (update) {
                    const dispatchedQty = update.dispatchedQuantity || 0;
                    const requestedQty = item.quantity;

                    if (dispatchedQty > 0) {
                        // Item is being sent (fully or partially)
                        const remainingQty = requestedQty - dispatchedQty;

                        // Current request gets the dispatched part
                        item.quantity = dispatchedQty;
                        item.dispatchedQuantity = dispatchedQty;
                        dispatchedItems.push(item);

                        // If partial, remaining goes to residual
                        if (remainingQty > 0) {
                            residualItems.push({
                                ...item.toObject(),
                                _id: undefined, // Let mongoose generate a new ID for the sub-document
                                quantity: remainingQty,
                                dispatchedQuantity: 0
                            });
                        }
                    } else {
                        // Not sent at all
                        residualItems.push({
                            ...item.toObject(),
                            _id: undefined,
                            dispatchedQuantity: 0
                        });
                    }
                } else {
                    // Not in updates? Treat as residual
                    residualItems.push({
                        ...item.toObject(),
                        _id: undefined,
                        dispatchedQuantity: 0
                    });
                }
            });

            // If we have residual items and we are moving to ready_for_pickup, split the request
            if (residualItems.length > 0 && status === 'ready_for_pickup') {
                const newRequest = new ProcurementRequest({
                    franchiseId: request.franchiseId,
                    items: residualItems,
                    status: 'approved', // Keep it approved so it shows in Active Dispatch
                    assignedVendorId: request.assignedVendorId,
                    adminId: request.adminId,
                    orderId: request.orderId,
                    totalEstimatedAmount: residualItems.reduce((acc, i) => acc + ((i.price || 0) * (i.quantity || 0)), 0),
                    totalQuotedAmount: residualItems.reduce((acc, i) => acc + ((i.quotedPrice || i.price || 0) * (i.quantity || 0)), 0)
                });
                await newRequest.save();

                // Lock current request items to only what was dispatched
                request.items = request.items.filter(i => (i.dispatchedQuantity || 0) > 0);
            } else if (status !== 'ready_for_pickup') {
                // For non-dispatch statuses (like 'preparing'), just update quantities without splitting
                itemUpdates.forEach(update => {
                    const item = request.items.find(i => i.productId?.toString() === update.productId?.toString());
                    if (item) {
                        item.dispatchedQuantity = update.dispatchedQuantity ?? item.quantity;
                    }
                });
            }

            // Recalculate total amount for current request
            request.totalQuotedAmount = request.items.reduce((acc, i) => acc + ((i.quotedPrice || i.price || 0) * (i.dispatchedQuantity || i.quantity || 0)), 0);
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
            }
        }

        await request.save();

        // Socket Notifications
        emitToAdmin('procurement_status_updated', {
            requestId: request._id,
            status: status,
            message: `Procurement #${request._id.toString().slice(-6)} moved to ${status.replace('_', ' ')}`
        });
        await createAdminNotification({
            type: 'procurement_status_updated',
            title: 'Procurement Updated',
            message: `Procurement #${request._id.toString().slice(-6)} moved to ${status.replace(/_/g, ' ')}.`,
            link: '/masteradmin/purchase',
            meta: {
                requestId: request._id.toString(),
                status,
                orderId: request.orderId?.toString?.() || '',
            }
        });

        if (request.franchiseId) {
            emitToFranchise(request.franchiseId, 'procurement_cycle_update', {
                requestId: request._id,
                status: status,
                message: `Vendor updated procurement #${request._id.toString().slice(-6)} status: ${status.replace('_', ' ')}`
            });

            // Push Notification to Franchise
            let title = "Procurement Update";
            let body = `Vendor updated your request #${request._id.toString().slice(-6)} to ${status.replace('_', ' ')}`;

            if (status === 'ready_for_pickup') {
                title = "Items Ready for Pickup";
                body = `Your procurement items are ready at vendor location.`;
            } else if (status === 'shipped') {
                title = "Items Dispatched";
                body = `The vendor has dispatched your procurement items. Check inbound logistics.`;
            }

            sendNotificationToUser(request.franchiseId.toString(), {
                title,
                body,
                data: {
                    type: "procurement",
                    requestId: request._id.toString(),
                    status: status,
                    link: `/franchise/receiving`
                }
            }, 'franchise');
        }

        // Update Order if exists
        if (request.orderId) {
            let userMessage = "";
            switch (status) {
                case 'preparing': userMessage = "Vendor is preparing your items."; break;
                case 'ready_for_pickup': userMessage = "Items are ready at vendor location and will be picked up soon."; break;
                case 'shipped': userMessage = "Items have been shipped from vendor to center."; break;
                default: userMessage = `Procurement status updated to ${status}`;
            }

            await Order.findByIdAndUpdate(request.orderId, {
                $push: {
                    statusHistory: {
                        status: 'Procuring',
                        updatedAt: new Date(),
                        updatedBy: 'system',
                        message: userMessage
                    }
                }
            });
        }

        return handleResponse(res, 200, "Status and quantities updated successfully", request);

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
        const { status, vendorId, adminId, itemId, items: editedItems } = req.body;

        console.log(`Admin updating request ${requestId}. Status: ${status}, Vendor: ${vendorId}, item: ${itemId}`);

        const request = await ProcurementRequest.findById(requestId);
        if (!request) {
            return handleResponse(res, 404, "Procurement request not found");
        }

        // Handle Item Edits by Admin (Price/Qty)
        if (editedItems && Array.isArray(editedItems)) {
            request.items.forEach(reqItem => {
                const edited = editedItems.find(i =>
                    (i._id && i._id === reqItem._id.toString()) ||
                    (i.productId?.toString() === reqItem.productId?.toString())
                );
                if (edited) {
                    if (edited.quotedPrice !== undefined) reqItem.quotedPrice = Number(edited.quotedPrice);
                    if (edited.quantity !== undefined) {
                        reqItem.quantity = Number(edited.quantity);
                    }
                }
            });
            // Recalculate Total
            request.totalQuotedAmount = request.items.reduce((acc, i) => acc + ((i.quotedPrice || i.price || 0) * (i.quantity || 0)), 0);
        }

        let requestToAssign = request;

        if (itemId && request.items.length > 1) {
            // Find the item index
            const itemIndex = request.items.findIndex(i =>
                (i.productId && i.productId.toString() === itemId.toString()) ||
                (i._id && i._id.toString() === itemId.toString()) ||
                (i.id && i.id.toString() === itemId.toString())
            );

            if (itemIndex > -1) {
                const itemToSplit = request.items[itemIndex];

                // Remove from original
                request.items.splice(itemIndex, 1);
                request.totalEstimatedAmount = request.items.reduce((acc, i) => acc + ((i.price || 0) * i.quantity), 0);
                request.totalQuotedAmount = request.items.reduce((acc, i) => acc + ((i.quotedPrice || i.price || 0) * i.quantity), 0);
                await request.save(); // Save original with remaining items

                // Create new request for this vendor
                const newRequest = new ProcurementRequest({
                    franchiseId: request.franchiseId,
                    orderId: request.orderId,
                    items: [itemToSplit],
                    totalEstimatedAmount: (itemToSplit.price || 0) * itemToSplit.quantity,
                    totalQuotedAmount: (itemToSplit.quotedPrice || itemToSplit.price || 0) * itemToSplit.quantity,
                    status: status || 'assigned',
                    assignedVendorId: vendorId,
                    adminId: adminId
                });
                await newRequest.save();
                requestToAssign = newRequest;
                console.log(`Splitted request ${requestId}. New Request ${newRequest._id} Assigned Vendor: ${newRequest.assignedVendorId}`);
            } else {
                // Item not found, fallback to original logic
                if (status) request.status = status;
                if (vendorId) request.assignedVendorId = vendorId;
                if (adminId) request.adminId = adminId;
                await request.save();
                console.log(`Request ${requestId} saved. Assigned Vendor: ${request.assignedVendorId}`);
            }
        } else {
            if (status) request.status = status;
            if (vendorId) request.assignedVendorId = vendorId;
            if (adminId) request.adminId = adminId;
            await request.save();
            console.log(`Request ${requestId} saved. Assigned Vendor: ${request.assignedVendorId}`);
        }

        // Notify Vendor
        if (requestToAssign.assignedVendorId) {
            emitToVendor(requestToAssign.assignedVendorId, "new_assignment", {
                requestId: requestToAssign._id,
                message: "You have a new procurement assignment!"
            });
            // Push Notification
            sendNotificationToUser(requestToAssign.assignedVendorId.toString(), {
                title: "New Procurement Assignment",
                body: "You have received a new procurement request from the Master Admin.",
                data: {
                    type: "assignment",
                    requestId: requestToAssign._id.toString(),
                    link: `/vendor/orders/${requestToAssign._id}`
                }
            }, 'vendor');
        }

        // Notify Franchise
        if (requestToAssign.franchiseId) {
            emitToFranchise(requestToAssign.franchiseId.toString(), 'procurement_cycle_update', {
                requestId: requestToAssign._id,
                status: 'assigned',
                message: `Master Admin has assigned a vendor for your procurement #${requestToAssign._id.toString().slice(-6)}`
            });
            // Push Notification
            sendNotificationToUser(requestToAssign.franchiseId.toString(), {
                title: "Procurement Vendor Assigned",
                body: "A vendor has been assigned to procurement request items for your node.",
                data: {
                    type: "procurement",
                    requestId: requestToAssign._id.toString(),
                    status: 'assigned',
                    link: `/franchise/receiving`
                }
            }, 'franchise');
        }

        // Update Order if exists
        if (requestToAssign.orderId) {
            await Order.findByIdAndUpdate(requestToAssign.orderId, {
                orderStatus: 'Procuring',
                $push: {
                    statusHistory: {
                        status: 'Procuring',
                        updatedAt: new Date(),
                        updatedBy: 'admin',
                        message: status === 'assigned' ? 'Vendor assigned for out-of-stock items.' : `Procurement order ${status}.`
                    }
                }
            });
        }

        return handleResponse(res, 200, "Procurement request updated successfully", requestToAssign);
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

        // Socket Notification to Vendor
        if (request.assignedVendorId) {
            emitToVendor(request.assignedVendorId, 'items_received_by_franchise', {
                requestId: request._id,
                status: 'completed',
                message: `Franchise confirmed receipt for request #${request._id.toString().slice(-6)}`
            });
        }

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

                // CRITICAL: Ensure we skip if no valid quantity was received
                if (quantityToAdd <= 0) continue;

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

        // Update Order and Auto-Pack if exists
        if (request.orderId) {
            try {
                const orderId = request.orderId;
                const order = await Order.findById(orderId);

                if (order) {
                    // 1. Reset/Reduce shortage flags based on RECEIVED quantities
                    let allShortagesResolved = true;

                    order.items = order.items.map(oItem => {
                        // Find matching item in procurement request
                        const reqItem = request.items.find(ri =>
                            ri.productId?.toString() === (oItem.productId?._id?.toString() || oItem.productId?.toString())
                        );

                        if (reqItem && oItem.isShortage) {
                            const received = reqItem.receivedQuantity || 0;
                            // Reduce shortage by what was actually received
                            oItem.shortageQty = Math.max(0, (oItem.shortageQty || 0) - received);
                            if (oItem.shortageQty === 0) {
                                oItem.isShortage = false;
                            }
                        }

                        // If anything is still a shortage, we haven't resolved the whole order
                        if (oItem.isShortage && oItem.shortageQty > 0) {
                            allShortagesResolved = false;
                        }

                        return oItem;
                    });

                    // 2. Only transition to 'Packed' if ALL shortages for the WHOLE order are gone
                    if (allShortagesResolved) {
                        order.orderStatus = 'Packed';
                        order.statusHistory.push({
                            status: 'Packed',
                            updatedAt: new Date(),
                            updatedBy: 'system',
                            message: 'All procurement items received. Order automatically packed and ready for dispatch.'
                        });

                        // 3. Deduct stock from inventory for THE WHOLE ORDER only when packing
                        const inventory = await Inventory.findOne({ franchiseId });
                        if (inventory) {
                            for (const item of order.items) {
                                const invItem = inventory.items.find(i =>
                                    i.productId.toString() === (item.productId?._id?.toString() || item.productId?.toString())
                                );
                                if (invItem) {
                                    invItem.currentStock = Math.max(0, invItem.currentStock - item.quantity);
                                    invItem.lastUpdated = new Date();
                                }
                            }
                            await inventory.save();
                        }
                    } else {
                        // Still in procuring state, just add a note
                        order.statusHistory.push({
                            status: 'Procuring',
                            updatedAt: new Date(),
                            updatedBy: 'system',
                            message: `Partial procurement of ${request.items.length} SKUs received. Remaining shortages still being tracked.`
                        });
                    }

                    await order.save();
                    console.log(`[AutoFlow] Order ${orderId} updated. Resolved: ${allShortagesResolved}`);
                }
            } catch (orderErr) {
                console.error("Auto-packing error after procurement:", orderErr);
            }
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
        const { vendorId, customQuantities } = req.body;
        const adminId = req.masteradmin?._id;

        const order = await Order.findById(orderId);

        if (!order) {
            return handleResponse(res, 404, "Order not found");
        }

        if (!order.franchiseId) {
            return handleResponse(res, 400, "Order is not assigned to a franchise yet");
        }

        const inventory = await Inventory.findOne({ franchiseId: order.franchiseId }).lean();
        const inventoryItems = inventory?.items || [];

        const shortageItems = order.items
            .map(item => {
                const productId = item.productId?._id || item.productId;
                if (!productId) return null;

                const inventoryItem = inventoryItems.find(invItem =>
                    invItem.productId?.toString() === productId.toString()
                );
                const availableStock = Number(inventoryItem?.currentStock || 0);
                const orderedQty = Number(item.quantity || 0);
                const persistedShortage = Number(item.shortageQty || 0);
                const computedShortage = Math.max(0, orderedQty - availableStock);
                const shortageQty = Math.max(computedShortage, persistedShortage);

                return {
                    ...item.toObject?.() || item,
                    productId,
                    isShortage: shortageQty > 0,
                    shortageQty
                };
            })
            .filter(item => item?.isShortage);
        if (shortageItems.length === 0) {
            return handleResponse(res, 400, "No items in this order require procurement");
        }

        if (!vendorId) {
            return handleResponse(res, 400, "Vendor is required to create procurement");
        }

        const mappedItems = shortageItems
            .map(item => {
                if (!item.productId) return null;

                const prodIdStr = item.productId.toString();

                let quantity = 0;
                if (customQuantities) {
                    // Procurement mode with specific quantities
                    const rawQty = customQuantities[prodIdStr];
                    quantity = rawQty !== undefined && rawQty !== null && rawQty !== ''
                        ? Number(rawQty)
                        : 0; // If not in customQuantities, it was explicitly excluded by Admin
                } else {
                    // Full bundle mode without custom quantities array
                    quantity = Number(item.shortageQty || 0);
                }

                return {
                    productId: prodIdStr,
                    name: item.name,
                    quantity,
                    unit: item.unit,
                    price: item.price,
                    image: item.image
                };
            })
            .filter(Boolean)
            .filter(item => item.quantity > 0);

        if (mappedItems.length === 0) {
            return handleResponse(res, 400, "No valid shortage quantities found for procurement");
        }

        const procurementRequest = new ProcurementRequest({
            franchiseId: order.franchiseId,
            items: mappedItems,
            totalEstimatedAmount: mappedItems.reduce((acc, item) => acc + ((item.price || 0) * item.quantity), 0),
            status: "assigned",
            assignedVendorId: vendorId,
            adminId: adminId,
            orderId: orderId
        });

        await procurementRequest.save();

        // Notify Vendor
        if (vendorId) {
            emitToVendor(vendorId, "new_assignment", {
                requestId: procurementRequest._id,
                message: "You have a new procurement assignment from an order!"
            });
            // Push Notification
            sendNotificationToUser(vendorId.toString(), {
                title: "New Procurement Assignment",
                body: "You have received a new procurement request triggered by an order.",
                data: {
                    type: "assignment",
                    requestId: procurementRequest._id.toString(),
                    link: `/vendor/orders/${procurementRequest._id}`
                }
            }, 'vendor');
        }

        // Notify Franchise
        if (order.franchiseId) {
            emitToFranchise(order.franchiseId.toString(), 'procurement_cycle_update', {
                requestId: procurementRequest._id,
                status: 'assigned',
                message: `Procurement request created for your order shortages. Vendor has been assigned.`
            });
        }

        // Update order to indicate procurement has started
        order.orderStatus = 'Procuring';
        order.statusHistory.push({
            status: 'Procuring',
            updatedAt: new Date(),
            updatedBy: 'admin',
            message: 'Order items are currently being procured from our vendor network.'
        });
        await order.save();

        return handleResponse(res, 201, "Procurement request created and assigned to vendor", procurementRequest);
    } catch (error) {
        console.error("Create procurement from order error:", error);
        return handleResponse(res, 500, "Server error: " + error.message);
    }
};

/** Post-delivery only: ready for franchise pickup or franchise receipt completed. */
const POST_DELIVERY_STATUSES = ["ready_for_pickup", "completed"];

/**
 * Receivables from admin after delivery/handoff only.
 * Scoped strictly to req.vendor (JWT) — never accepts client-supplied vendor id.
 */
export const getVendorReceivablesReport = async (req, res) => {
    try {
        const vendorIdStr = req.vendor._id.toString();

        const requests = await ProcurementRequest.find({
            assignedVendorId: vendorIdStr,
            status: { $in: POST_DELIVERY_STATUSES },
        })
            .populate("franchiseId", "shopName ownerName cityArea")
            .sort({ updatedAt: -1 })
            .lean();

        const totalAmount = requests.reduce(
            (s, r) => s + (Number(r.totalQuotedAmount) || 0),
            0
        );

        const rows = requests.map((r) => {
            const fr = r.franchiseId;
            return {
                requestId: r._id,
                ref: String(r._id).slice(-6).toUpperCase(),
                franchiseName: fr?.shopName || fr?.ownerName || "Franchise",
                cityArea: fr?.cityArea || "",
                status: r.status,
                amount: Number(r.totalQuotedAmount) || 0,
                updatedAt: r.updatedAt,
            };
        });

        return handleResponse(res, 200, "Vendor receivables report", {
            summary: {
                count: requests.length,
                totalAmount,
            },
            rows,
        });
    } catch (error) {
        console.error("Get vendor receivables report error:", error);
        return handleResponse(res, 500, "Server error");
    }
};

// Get Vendor Dashboard Stats (Vendor)
export const getVendorDashboardStats = async (req, res) => {
    try {
        const vendorId = req.vendor._id.toString();
        const vendor = await Vendor.findById(vendorId).select("status");

        // 1. Fetch all requests for this vendor
        const allRequests = await ProcurementRequest.find({
            assignedVendorId: vendorId
        }).lean();

        // 2. Fetch inventory for this vendor
        const inventory = await VendorInventory.findOne({ vendorId }).lean();
        const stockQuantity = inventory?.items?.reduce((sum, item) => sum + (item.currentStock || 0), 0) || 0;
        const availableProduce = inventory?.items?.filter(item => item.available).length || 0;

        // 3. Calculate Active Ops (approved, preparing, ready_for_pickup)
        const activeOps = allRequests.filter(r =>
            ['approved', 'preparing', 'ready_for_pickup'].includes(r.status)
        ).length;

        // 4. Calculate Escrow Settlement (Sum of totalQuotedAmount for ready_for_pickup or completed but not settled)
        // For now, let's say ready_for_pickup and completed are part of settlement
        const pendingSettlement = allRequests
            .filter(r => ['ready_for_pickup', 'completed'].includes(r.status))
            .reduce((sum, r) => sum + (r.totalQuotedAmount || 0), 0);

        // 5. Calculate Metric Turnover (Total completed revenue)
        const totalTurnover = allRequests
            .filter(r => r.status === 'completed')
            .reduce((sum, r) => sum + (r.totalQuotedAmount || 0), 0);

        // 6. Performance Metrics
        const completedCount = allRequests.filter(r => r.status === 'completed').length;
        const totalAssigned = allRequests.length;
        const fulfillmentRate = totalAssigned > 0 ? Math.round((completedCount / totalAssigned) * 100) : 0;

        // 7. Archive Vol
        const archiveVol = completedCount;

        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const currentMonthTurnover = allRequests
            .filter(r => r.status === 'completed' && new Date(r.updatedAt) >= currentMonthStart)
            .reduce((sum, r) => sum + (Number(r.totalQuotedAmount) || 0), 0);

        const previousMonthTurnover = allRequests
            .filter(r =>
                r.status === 'completed' &&
                new Date(r.updatedAt) >= previousMonthStart &&
                new Date(r.updatedAt) < currentMonthStart
            )
            .reduce((sum, r) => sum + (Number(r.totalQuotedAmount) || 0), 0);

        const yieldDelta = currentMonthTurnover - previousMonthTurnover;

        const completedOrReady = allRequests.filter(r =>
            ['ready_for_pickup', 'completed'].includes(r.status)
        );
        const avgPrepMs = completedOrReady.length > 0
            ? completedOrReady.reduce((sum, r) => {
                const created = new Date(r.createdAt).getTime();
                const finished = new Date(r.updatedAt).getTime();
                return sum + Math.max(0, finished - created);
            }, 0) / completedOrReady.length
            : 0;
        const avgPrepDays = avgPrepMs / (1000 * 60 * 60 * 24);

        const oldestActive = allRequests
            .filter(r => ['approved', 'preparing', 'ready_for_pickup'].includes(r.status))
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];
        const syncMinutes = oldestActive
            ? Math.max(1, Math.round((Date.now() - new Date(oldestActive.createdAt).getTime()) / 60000))
            : 0;

        const previousTurnoverBase = previousMonthTurnover || 0;
        const settlementTrend = previousTurnoverBase > 0
            ? ((pendingSettlement - previousTurnoverBase) / previousTurnoverBase) * 100
            : 0;
        const turnoverTrend = previousTurnoverBase > 0
            ? (yieldDelta / previousTurnoverBase) * 100
            : 0;

        return handleResponse(res, 200, "Vendor dashboard stats fetched", {
            activeOps,
            pendingSettlement,
            totalTurnover,
            payoutCycleDays: Number(avgPrepDays.toFixed(1)),
            verificationStatus: vendor?.status === "active" ? "Alpha Verified" : "Pending Verification",
            syncMinutes,
            trends: {
                pendingSettlement: Number(settlementTrend.toFixed(1)),
                yieldDelta: Number(turnoverTrend.toFixed(1)),
                totalTurnover: Number(turnoverTrend.toFixed(1)),
            },
            inventory: {
                stockQuantity,
                availableProduce
            },
            performance: {
                fulfillmentRate,
                avgPrepTime: `${avgPrepDays.toFixed(1)} Days`,
                archiveVol,
                yieldDelta
            }
        });

    } catch (error) {
        console.error("Get vendor dashboard stats error:", error);
        return handleResponse(res, 500, "Server error");
    }
};
