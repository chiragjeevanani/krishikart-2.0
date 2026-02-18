import Order from "../models/order.js";
import Product from "../models/product.js";
import Cart from "../models/cart.js";
import User from "../models/user.js";
import Franchise from "../models/franchise.js";
import handleResponse from "../utils/helper.js";

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

        // 2. Process Items and Calculate Totals
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

        // Fixed fees for now (could be dynamic)
        const deliveryFee = subtotal > 1000 ? 0 : 50;
        const tax = Math.round(subtotal * 0.05); // 5% GST
        const totalAmount = subtotal + deliveryFee + tax;

        // 3. Handle Payments (Wallet/Credit)
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

        // 3.5 Broadcast Order Model - No specific franchise assignment
        // Orders are visible to ALL franchises, first to accept will get it
        console.log('=== Broadcast Order Model ===');
        const franchiseId = null; // No assignment - visible to all
        console.log('Order will be broadcast to ALL active franchises');

        // 4. Create Order
        const order = new Order({
            userId,
            franchiseId,
            items: orderItems,
            subtotal,
            deliveryFee,
            tax,
            totalAmount,
            paymentMethod,
            paymentStatus: (paymentMethod === 'Wallet' || paymentMethod === 'Credit') ? 'Completed' : 'Pending',
            orderStatus: 'Placed',
            shippingAddress
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
            .populate('franchiseId', 'storeName shopName ownerName mobile');
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

        const order = await Order.findByIdAndUpdate(id, { orderStatus: status }, { new: true });
        if (!order) return handleResponse(res, 404, "Order not found");

        return handleResponse(res, 200, `Order status updated to ${status}`, order);
    } catch (error) {
        return handleResponse(res, 500, "Server error");
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'fullName mobile')
            .populate('franchiseId', 'shopName ownerName mobile cityArea')
            .sort({ createdAt: -1 });
        return handleResponse(res, 200, "All orders fetched", orders);
    } catch (error) {
        return handleResponse(res, 500, "Server error");
    }
};

export const getFranchiseOrders = async (req, res) => {
    try {
        const franchiseId = req.franchise._id;
        console.log('=== Fetching Broadcast Orders ===');
        console.log('Franchise ID:', franchiseId);
        console.log('Franchise Name:', req.franchise.shopName);

        // Broadcast Model: Show all unassigned orders (franchiseId = null)
        // OR orders already accepted by this franchise
        const orders = await Order.find({
            $or: [
                { franchiseId: null },           // Unassigned/broadcast orders
                { franchiseId: franchiseId }     // Orders accepted by this franchise
            ]
        })
            .populate('userId', 'fullName mobile')
            .sort({ createdAt: -1 });

        console.log(`Found ${orders.length} orders (broadcast + accepted)`);
        if (orders.length > 0) {
            const unassigned = orders.filter(o => !o.franchiseId).length;
            const accepted = orders.filter(o => o.franchiseId?.toString() === franchiseId.toString()).length;
            console.log(`Unassigned: ${unassigned}, Accepted by this franchise: ${accepted}`);
        }

        return handleResponse(res, 200, "Franchise orders fetched", orders);
    } catch (error) {
        return handleResponse(res, 500, "Server error");
    }
};

// Get franchise order by ID
export const getFranchiseOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const franchiseId = req.franchise._id;

        const order = await Order.findById(id).populate('userId', 'fullName mobile address');

        if (!order) {
            return handleResponse(res, 404, "Order not found");
        }

        // Allow if order is unassigned (broadcast) OR assigned to this franchise
        if (order.franchiseId && order.franchiseId.toString() !== franchiseId.toString()) {
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

        // Only allow accepting unassigned orders
        if (order.franchiseId) {
            return handleResponse(res, 400, "Order already accepted by another franchise");
        }

        // Assign franchise and update status
        order.franchiseId = franchiseId;
        order.orderStatus = 'Processing';
        await order.save();

        console.log(`✅ Order ${id} accepted by franchise ${franchiseId}`);

        return handleResponse(res, 200, "Order accepted successfully", order);
    } catch (error) {
        console.error('Accept order error:', error);
        return handleResponse(res, 500, "Server error");
    }
};

