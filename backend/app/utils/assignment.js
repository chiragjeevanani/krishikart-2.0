import Franchise from '../models/franchise.js';
import Order from '../models/order.js';
import Delivery from '../models/delivery.js';
import { sendNotificationToUser } from './pushNotificationHelper.js';
import { emitToFranchise, emitToDelivery } from '../lib/socket.js';
import { latLngToCell, gridDisk } from 'h3-js';

/**
 * Finds the nearest eligible franchise for an order
 * @param {Object} location Customer location {lat, lng}
 * @param {Array} excludeIds List of franchise IDs to exclude (already tried)
 * @returns {Promise<Object|null>}
 */
export const findNearestFranchise = async (location, excludeIds = []) => {
    try {
        const { lat, lng } = location;

        // 1. Calculate Hexagon string from lat/lng (Resolution 8 is approx 1km-ish radius width)
        const orderHex = latLngToCell(lat, lng, 8);
        console.log(`[Assignment] Customer Hexagon (res 8): ${orderHex}`);

        // 2. Retrieve all active franchises
        let activeFranchisesQuery = {
            isActive: true,
            isOnline: true,
            capacityAvailable: true,
            _id: { $nin: excludeIds }
        };

        // First attempt: Exact match Hexagon Service Area
        let nearestFranchises = await Franchise.find({
            ...activeFranchisesQuery,
            serviceHexagons: orderHex
        });

        if (nearestFranchises.length > 0) {
            console.log(`[Assignment] Found ${nearestFranchises.length} franchises via EXACT H3 Hexagon matching.`);
        } else {
            console.log(`[Assignment] No exact H3 match... falling back to 25km radius query for UNCONFIGURED franchises.`);
            // Only fall back to franchises that have ZERO hexagons defined (unconfigured/legacy)
            nearestFranchises = await Franchise.find({
                ...activeFranchisesQuery,
                serviceHexagons: { $size: 0 },
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [lng, lat]
                        },
                        $maxDistance: 25000 // 25km in meters
                    }
                }
            });
        }

        // Convert UTC to IST (+5:30) for India-based working hours
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istTime = new Date(now.getTime() + istOffset);

        const currentTime = `${istTime.getUTCHours().toString().padStart(2, '0')}:${istTime.getUTCMinutes().toString().padStart(2, '0')}`;

        console.log(`[Assignment] Found ${nearestFranchises.length} nearest franchises at ${currentTime} (IST).`);

        for (const franchise of nearestFranchises) {
            const { start, end } = franchise.workingHours || { start: "09:00", end: "21:00" };
            console.log(`[Assignment] checking ${franchise.franchiseName}: Hours ${start}-${end}, Current: ${currentTime}`);

            if (currentTime >= start && currentTime <= end) {
                return franchise;
            }
        }

        console.warn(`[Assignment] No franchise found in working hours among ${nearestFranchises.length} candidates.`);
        return null;
    } catch (error) {
        console.error('[Assignment] Error finding nearest franchise:', error);
        return null;
    }
};

/**
 * Assigns an order to the nearest franchise and starts failover timer
 * @param {String} orderId 
 */
export const assignOrderToFranchise = async (orderId) => {
    try {
        const order = await Order.findById(orderId).populate('shippingLocation');
        if (!order) return;

        const excludeIds = order.assignmentAttempts.map(a => a.franchiseId);

        // Convert shippingLocation to lat/lng format if it's GeoJSON
        const location = {
            lat: order.shippingLocation.coordinates[1],
            lng: order.shippingLocation.coordinates[0]
        };

        const franchise = await findNearestFranchise(location, excludeIds);

        if (franchise) {
            order.franchiseId = franchise._id;
            order.orderStatus = 'Accepted';
            order.assignmentAttempts.push({
                franchiseId: franchise._id,
                attemptedAt: new Date(),
                reason: 'auto-assigned'
            });

            // Add to history
            order.statusHistory.push({
                status: 'Accepted',
                updatedAt: new Date(),
                updatedBy: 'system'
            });

            await order.save();

            // Send Push Notification
            await sendNotificationToUser(franchise._id, {
                title: 'New Order Auto-Assigned',
                body: `Order #${order._id.toString().slice(-6)} has been assigned to you. Prepare for packing!`,
                data: {
                    type: 'new_order',
                    orderId: order._id.toString(),
                    link: `/franchise/orders/${order._id}`
                }
            }, 'franchise');

            // Send Socket Real-time Notification
            emitToFranchise(franchise._id, 'new_order', {
                orderId: order._id,
                message: `New Order Auto-Assigned: #${order._id.toString().slice(-6)}`
            });

            console.log(`[Assignment Success] Order ${orderId} assigned to Franchise ${franchise.franchiseName || franchise._id}`);
            return true;
        } else {
            console.warn(`[Assignment Failure] No eligible franchise found for order ${orderId} within 10km radius.`);
            return false;
        }
    } catch (error) {
        console.error('Error assigning order to franchise:', error);
        return false;
    }
};

/**
 * Finds the nearest eligible delivery partner for an order
 * @param {Object} location Franchise location {lat, lng}
 * @returns {Promise<Object|null>}
 */
export const findNearestDeliveryPartner = async (location) => {
    try {
        const { lat, lng } = location;

        // Find nearest delivery partners within 5km
        const nearestPartner = await Delivery.findOne({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [lng, lat]
                    },
                    $maxDistance: 5000 // 5km
                }
            },
            status: "active",
            isOnline: true
        });

        return nearestPartner;
    } catch (error) {
        console.error('Error finding nearest delivery partner:', error);
        return null;
    }
};

/**
 * Assigns an order to the nearest delivery partner
 * @param {String} orderId 
 */
export const assignDeliveryToOrder = async (orderId) => {
    try {
        const order = await Order.findById(orderId).populate('franchiseId');
        if (!order || !order.franchiseId) return;

        const franchise = await Franchise.findById(order.franchiseId);
        if (!franchise) return;

        const location = {
            lat: franchise.location.coordinates[1],
            lng: franchise.location.coordinates[0]
        };

        const partner = await findNearestDeliveryPartner(location);

        if (partner) {
            order.deliveryPartnerId = partner._id;
            // Status remains Accepted or becomes Packed? 
            // Usually assigned when packed or accepted.
            await order.save();

            // Send Notification
            await sendNotificationToUser(partner._id, {
                title: 'New Delivery Assigned',
                body: `You have a new delivery assignment for order #${order._id.toString().slice(-6)}.`,
                data: {
                    type: 'new_delivery',
                    orderId: order._id.toString(),
                    link: `/delivery/assignments/${order._id}`
                }
            }, 'delivery');

            // Send Socket Real-time Notification
            emitToDelivery(partner._id, 'new_task', {
                orderId: order._id,
                type: 'DELIVERY',
                message: `New delivery task assigned: #${order._id.toString().slice(-6)}`
            });

            return true;
        }
        return false;
    } catch (error) {
        console.error('Error assigning delivery partner:', error);
        return false;
    }
};
