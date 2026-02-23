import Order from '../models/order.js';
import { handleResponse } from '../utils/helper.js';
import { emitToAdmin, emitToOrderRoom } from '../lib/socket.js';
import Product from "../models/product.js";
import Cart from "../models/cart.js";
import User from "../models/user.js";
import Franchise from "../models/franchise.js";
import GlobalSetting from "../models/globalSetting.js";
import { geocodeAddress, getDistance } from "../utils/geo.js";

/**
 * Helper to calculate price based on quantity and bulk pricing rules
 */
const calculateItemPrice = (product, quantity) => {
    let price = product.price; // Standard price
    let isBulkRate = false;

    if (product.bulkPricing && product.bulkPricing.length > 0) {
        // Sort bulk pricing by minQty descending to find the best match
        const sortedBulk = [...product.bulkPricing].sort((a, b) => b.minQty - a.minQty);
        const applicableBulk = sortedBulk.find(bp => quantity >= bp.minQty);

        if (applicableBulk) {
            price = applicableBulk.price;
            isBulkRate = true;
        }
    }

    return { price, isBulkRate };
};

/**
 * Helper to calculate distance between two points using Haversine formula
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { shippingAddress, paymentMethod } = req.body;

        if (!shippingAddress || !paymentMethod) {
            return handleResponse(res, 400, "Shipping address and payment method are required");
        }

        // 1. Get User Cart
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) {
            return handleResponse(res, 400, "Your cart is empty");
        }

        const user = await User.findById(userId);
        if (!user) return handleResponse(res, 404, "User not found");

        // 2.5 Fetch Delivery Constraints from Admin Settings
        const settings = await GlobalSetting.findOne({ key: 'delivery_constraints' });
        const constraints = settings?.value || { baseFee: 40, freeMov: 500, tax: 5, platformFee: 2 };

        // 3. Process Items and Calculate Totals
        let subtotal = 0;
        const orderItems = [];

        for (const item of cart.items) {
            const product = item.productId;
            if (!product || product.status !== 'active') {
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

        // 4. Calculate Delivery Fee and Tax
        const deliveryFee = subtotal >= parseFloat(constraints.freeMov) ? 0 : parseFloat(constraints.baseFee);
        const platformFee = 0; // Explicitly removed

        // Dynamic Tax applied to the entire order (Subtotal + Fees)
        const taxRate = parseFloat(constraints.tax || 0) / 100;
        const tax = Number(((subtotal + deliveryFee) * taxRate).toFixed(2));
        const totalAmount = Number((subtotal + deliveryFee + tax).toFixed(2));

        // 5. Handle Payments (Wallet/Credit)
        if (paymentMethod === 'Wallet') {
            if (user.walletBalance < totalAmount) {
                return handleResponse(res, 400, "Insufficient wallet balance");
            }
            user.walletBalance -= totalAmount;
        } else if (paymentMethod === 'Credit') {
            const availableCredit = user.creditLimit - user.usedCredit;
            if (availableCredit < totalAmount) {
                return handleResponse(res, 400, "Insufficient credit limit");
            }
            user.usedCredit += totalAmount;
        }

        // 6. Auto Franchise Assignment
        let assignedFranchiseId = null;
        let userCoords = null;
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

        // 7. Create Order
        const order = new Order({
            userId,
            franchiseId: assignedFranchiseId,
            items: orderItems,
            subtotal,
            deliveryFee,
            platformFee, // Note: Order model might need this field if tracking separately
            tax,
            totalAmount,
            paymentMethod,
            paymentStatus: (paymentMethod === 'Wallet' || paymentMethod === 'Credit') ? 'Completed' : 'Pending',
            orderStatus: 'Placed',
            shippingAddress,
            shippingLocation: userCoords
        });

        await order.save();
        await user.save();

        // 5. Clear Cart
        cart.items = [];
        await cart.save();

        return handleResponse(res, 201, "Order placed successfully", order);

    } catch (error) {
        console.error("Create order error:", error);
        return handleResponse(res, 500, "Server error");
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });
        return handleResponse(res, 200, "Orders fetched successfully", orders);
    } catch (error) {
        return handleResponse(res, 500, "Server error");
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.productId')
            .populate('userId', 'fullName mobile address')
            .populate('franchiseId', 'storeName shopName ownerName mobile')
            .populate('deliveryPartnerId', 'fullName mobile vehicleNumber vehicleType');
        if (!order) return handleResponse(res, 404, "Order not found");

        // Authorization logic
        const userId = req.user?.id || req.user?._id;
        const franchiseId = req.franchise?._id;
        const isMasterAdmin = !!req.masteradmin;

        const isOwner = userId && order.userId._id.toString() === userId.toString();
        const isAssignedFranchise = franchiseId && order.franchiseId?.toString() === franchiseId.toString();

        if (!isMasterAdmin && !isOwner && !isAssignedFranchise) {
            return handleResponse(res, 403, "Unauthorized access");
        }

        return handleResponse(res, 200, "Order details fetched", order);
    } catch (error) {
        console.error("Get order by id error:", error);
        return handleResponse(res, 500, "Server error");
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findById(id);
        if (!order) return handleResponse(res, 404, "Order not found");

        const currentStatus = order.orderStatus;
        const allowedStatuses = ['Placed', 'Packed', 'Dispatched', 'Delivered', 'Received', 'Cancelled'];

        console.log(`[DEBUG] MasterAdmin: ${!!req.masteradmin}, Order: ${id}, Status: ${status}`);

        if (!allowedStatuses.includes(status)) {
            return handleResponse(res, 400, `Invalid status value: ${status}`);
        }

        // Role-based validation
        const isMasterAdmin = !!req.masteradmin;
        const isFranchise = !!req.franchise;
        const isDelivery = !!req.delivery || req.user?.role === 'delivery';
        const isUser = !!req.user && !isMasterAdmin && !isDelivery;

        // Transitions logic (Master Admin can bypass)
        const statusFlow = {
            'Placed': ['Packed', 'Cancelled'],
            'Packed': ['Dispatched', 'Cancelled'],
            'Dispatched': ['Delivered', 'Cancelled'],
            'Delivered': ['Received'],
            'Received': [],
            'Cancelled': []
        };

        if (!isMasterAdmin && status !== 'Cancelled' && (!statusFlow[currentStatus] || !statusFlow[currentStatus].includes(status))) {
            return handleResponse(res, 400, `Transition Error: Cannot move from ${currentStatus} to ${status}`);
        }

        // Authorization checks
        if (!isMasterAdmin) {
            if (['Packed', 'Dispatched'].includes(status) && !isFranchise) {
                return handleResponse(res, 403, "Only franchise can update to Packed/Dispatched");
            }
            if (status === 'Delivered' && !isDelivery && !isFranchise) {
                return handleResponse(res, 403, "Only delivery partner can update to Delivered");
            }
            // Delivery Specific: Check if this order is assigned to this partner
            if (isDelivery && status === 'Delivered') {
                const partnerId = req.delivery?._id || req.user?.id;
                if (!partnerId || !order.deliveryPartnerId || order.deliveryPartnerId.toString() !== partnerId.toString()) {
                    return handleResponse(res, 403, "This order is not assigned to you");
                }
            }
            if (status === 'Received' && !isUser) {
                return handleResponse(res, 403, "Only user can update to Received");
            }
        }

        order.orderStatus = status;

        // Push to history
        let updatedBy = 'system';
        if (isMasterAdmin) updatedBy = 'masteradmin';
        else if (isFranchise) updatedBy = 'franchise';
        else if (isDelivery) updatedBy = 'delivery';
        else if (isUser) updatedBy = 'user';

        order.statusHistory.push({
            status,
            updatedAt: new Date(),
            updatedBy
        });

        if (status === 'Delivered') {
            order.deliveredAt = new Date();
        }

        await order.save();

        // Socket Broadcasts
        const populatedOrder = await Order.findById(order._id)
            .populate('userId', 'fullName mobile')
            .populate('deliveryPartnerId', 'fullName mobile vehicleNumber vehicleType')
            .populate('franchiseId', 'franchiseName ownerName city');

        emitToAdmin('order_status_updated', populatedOrder);
        emitToOrderRoom(order._id, 'order_status_changed', {
            orderId: order._id,
            status: status,
            updatedAt: new Date()
        });

        return handleResponse(res, 200, `Order status updated to ${status}`, order);
    } catch (error) {
        console.error("Update order status error details:", error);
        return handleResponse(res, 500, "Server error: " + error.message);
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'fullName mobile')
            .populate('franchiseId', 'shopName ownerName mobile cityArea')
            .populate('deliveryPartnerId', 'fullName mobile')
            .sort({ createdAt: -1 });

        const formattedOrders = orders.map((order) => {
            const dateObj = new Date(order.createdAt);
            return {
                ...order.toObject(),
                date: dateObj.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    timeZone: 'Asia/Kolkata'
                }),
                time: dateObj.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                    timeZone: 'Asia/Kolkata'
                })
            };
        });

        return handleResponse(res, 200, "All orders fetched", formattedOrders);
    } catch (error) {
        console.error("Get all orders error:", error);
        return handleResponse(res, 500, "Server error");
    }
};

export const getFranchiseOrders = async (req, res) => {
    try {
        const franchiseId = req.franchise._id;
        const { date } = req.query;

        let query = { franchiseId: franchiseId };

        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query.createdAt = { $gte: startOfDay, $lte: endOfDay };
        }

        console.log('=== Fetching Franchise Orders ===');
        console.log('Query:', JSON.stringify(query));

        // Fetch Assigned + Unassigned Orders
        const orders = await Order.find(query)
            .populate('userId', 'fullName mobile')
            .populate('deliveryPartnerId', 'fullName mobile vehicleNumber vehicleType')
            .sort({ createdAt: -1 });

        console.log(`Found ${orders.length} orders (Assigned: ${orders.filter(o => o.franchiseId).length}, Broadcast: ${orders.filter(o => !o.franchiseId).length})`);

        const formattedOrders = orders.map((order) => {
            const dateObj = new Date(order.createdAt);
            return {
                ...order.toObject(),
                date: dateObj.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    timeZone: 'Asia/Kolkata'
                }),
                time: dateObj.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                    timeZone: 'Asia/Kolkata'
                })
            };
        });

        return handleResponse(res, 200, "Franchise orders fetched", formattedOrders);
    } catch (error) {
        return handleResponse(res, 500, "Server error");
    }
};

// Get franchise order by ID
export const getFranchiseOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const franchiseId = req.franchise._id;

        const order = await Order.findById(id)
            .populate('userId', 'fullName mobile address')
            .populate('deliveryPartnerId', 'fullName mobile vehicleNumber vehicleType');

        if (!order) {
            return handleResponse(res, 404, "Order not found");
        }

        // Allow only if assigned to this franchise
        if (!order.franchiseId || order.franchiseId.toString() !== franchiseId.toString()) {
            return handleResponse(res, 403, "Not authorized to view this order");
        }

        return handleResponse(res, 200, "Order details fetched", order);
    } catch (error) {
        console.error('Get franchise order error:', error);
        return handleResponse(res, 500, "Server error");
    }
};

// Accept broadcast order (assign to franchise)
export const acceptFranchiseOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const franchiseId = req.franchise._id;

        const order = await Order.findById(id);

        if (!order) {
            return handleResponse(res, 404, "Order not found");
        }

        // Only allow accepting if unassigned OR already assigned to this franchise (acknowledgment)
        if (order.franchiseId && order.franchiseId.toString() !== franchiseId.toString()) {
            return handleResponse(res, 400, "Order already accepted by another franchise");
        }

        // Assign franchise and keep status as Placed
        order.franchiseId = franchiseId;
        order.statusHistory.push({
            status: order.orderStatus,
            updatedAt: new Date(),
            updatedBy: 'franchise'
        });
        await order.save();

        console.log(`✅ Order ${id} accepted by franchise ${franchiseId}`);

        return handleResponse(res, 200, "Order accepted successfully", order);
    } catch (error) {
        console.error('Accept order error:', error);
        return handleResponse(res, 500, "Server error");
    }
};

// Assign delivery partner to order
export const assignDeliveryPartner = async (req, res) => {
    try {
        const { id } = req.params;
        const { deliveryPartnerId } = req.body;
        const franchiseId = req.franchise._id;

        const order = await Order.findById(id);

        if (!order) {
            return handleResponse(res, 404, "Order not found");
        }

        // Authorization check
        if (order.franchiseId.toString() !== franchiseId.toString()) {
            return handleResponse(res, 403, "Not authorized to manage this order");
        }

        if (!deliveryPartnerId) {
            return handleResponse(res, 400, "Delivery partner ID is required");
        }

        order.deliveryPartnerId = deliveryPartnerId;
        order.orderStatus = 'Dispatched';
        order.statusHistory.push({
            status: 'Dispatched',
            updatedAt: new Date(),
            updatedBy: 'franchise'
        });

        await order.save();

        console.log(`🚚 Order ${id} dispatched by franchise ${franchiseId} via partner ${deliveryPartnerId}`);

        return handleResponse(res, 200, "Order dispatched successfully", order);
    } catch (error) {
        console.error('Assign delivery partner error:', error);
        return handleResponse(res, 500, "Server error");
    }
};

// Get dispatched orders for delivery partner
export const getDispatchedOrders = async (req, res) => {
    try {
        const partnerId = req.delivery?._id;
        const orders = await Order.find({
            orderStatus: 'Dispatched',
            deliveryPartnerId: partnerId
        })
            .populate('userId', 'fullName mobile address')
            .populate('franchiseId', 'shopName address location')
            .sort({ updatedAt: -1 });

        // Map to format delivery app expects
        const formatted = orders.map(order => {
            let distance = 'N/A';

            // Calculate real distance if coords available
            if (order.franchiseId?.location?.lat && order.shippingLocation?.lat) {
                const d = getDistance(
                    order.franchiseId.location.lat, order.franchiseId.location.lng,
                    order.shippingLocation.lat, order.shippingLocation.lng
                );
                distance = d < 1 ? `${(d * 1000).toFixed(0)}m` : `${d.toFixed(1)}km`;
            }

            return {
                id: order._id,
                franchise: order.franchiseId?.shopName || 'KrishiKart Store',
                franchiseAddress: order.franchiseId?.address || 'N/A',
                customerName: order.userId?.fullName || 'Customer',
                customerAddress: order.shippingAddress,
                distance: distance,
                itemsCount: order.items.reduce((acc, item) => acc + item.quantity, 0),
                items: order.items,
                timeWindow: '20-30 mins',
                priority: 'medium',
                amount: 50, // Delivery earnings per order
                status: order.orderStatus,
                franchiseId: order.franchiseId,
                userId: order.userId,
                shippingAddress: order.shippingAddress
            };
        });

        return handleResponse(res, 200, "Dispatched orders fetched", formatted);
    } catch (error) {
        console.error('Get dispatched orders error:', error);
        return handleResponse(res, 500, "Server error");
    }
};

// Get completed orders for delivery partner (History)
export const getDeliveryOrderHistory = async (req, res) => {
    try {
        const partnerId = req.delivery?._id;
        // Find orders that are delivered or received and assigned to this partner
        const orders = await Order.find({
            orderStatus: { $in: ['Delivered', 'Received'] },
            deliveryPartnerId: partnerId
        })
            .populate('userId', 'fullName')
            .populate('franchiseId', 'shopName address')
            .sort({ updatedAt: -1 });

        const formatted = orders.map(order => {
            const dateObj = new Date(order.updatedAt);
            return {
                id: order._id,
                customer: order.userId?.fullName || 'Customer',
                franchiseName: order.franchiseId?.shopName || 'KrishiKart Store',
                franchiseAddress: order.franchiseId?.address || 'N/A',
                items: order.items,
                amount: 50, // Earnings
                status: 'delivered',
                date: dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                time: dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
            };
        });

        return handleResponse(res, 200, "Delivery history fetched", formatted);
    } catch (error) {
        console.error('Get delivery history error:', error);
        return handleResponse(res, 500, "Server error");
    }
};
