import Franchise from "../models/franchise.js";
import Order from "../models/order.js";
import Delivery from "../models/delivery.js";
import { sendNotificationToUser } from "./pushNotificationHelper.js";
import { emitToFranchise, emitToDelivery } from "../lib/socket.js";
import { latLngToCell, gridDisk } from "h3-js";

/**
 * Finds the nearest eligible franchise for an order
 * @param {Object} location Customer location {lat, lng}
 * @param {Array} excludeIds List of franchise IDs to exclude (already tried)
 * @param {Array} categoryIds List of category IDs in the order
 * @returns {Promise<Object|null>}
 */
export const findNearestFranchise = async (
  location,
  excludeIds = [],
  categoryIds = [],
) => {
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
      _id: { $nin: excludeIds },
    };

    // If categories are provided, filter franchises that serve ALL of these categories.
    // Use $all to ensure the franchise supports every category in the order.
    if (categoryIds && categoryIds.length > 0) {
      activeFranchisesQuery.servedCategories = { $all: categoryIds };
    }

    // First attempt: Exact match Hexagon Service Area
    let nearestFranchises = await Franchise.find({
      ...activeFranchisesQuery,
      serviceHexagons: orderHex,
    });

    if (nearestFranchises.length > 0) {
      console.log(
        `[Assignment] Found ${nearestFranchises.length} franchises via EXACT H3 Hexagon matching.`,
      );
    } else {
      console.log(
        `[Assignment] No exact H3 match... falling back to 25km radius query for ALL active franchises.`,
      );
      // Fall back to all active franchises within 25km radius
      nearestFranchises = await Franchise.find({
        ...activeFranchisesQuery,
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat],
            },
            $maxDistance: 25000, // 25km in meters
          },
        },
      });
    }

    // Always compute business time in India timezone, independent of server timezone.
    const currentTime = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date());

    console.log(
      `[Assignment] Found ${nearestFranchises.length} nearest franchises at ${currentTime} (IST).`,
    );

    // If it's outside working hours, we still want to assign it so the franchise can see it when they open.
    // We will just prioritize franchises that are currently in working hours.
    let bestCandidate = null;

    for (const franchise of nearestFranchises) {
      const { start, end } = franchise.workingHours || {
        start: "09:00",
        end: "21:00",
      };
      console.log(
        `[Assignment] checking ${franchise.franchiseName}: Hours ${start}-${end}, Current: ${currentTime}`,
      );

      if (currentTime >= start && currentTime <= end) {
        return franchise;
      }
      // If no one is in working hours, the first one (nearest) will be the best candidate
      if (!bestCandidate) bestCandidate = franchise;
    }

    if (bestCandidate) {
      console.log(
        `[Assignment] No franchise found in working hours, assigning to nearest candidate ${bestCandidate.franchiseName} for next-day processing.`,
      );
      return bestCandidate;
    }

    console.warn(`[Assignment] No eligible franchise found at all.`);
    return null;
  } catch (error) {
    console.error("[Assignment] Error finding nearest franchise:", error);
    return null;
  }
};

/**
 * Assigns an order to the nearest franchise and starts failover timer
 * @param {String} orderId
 */
export const assignOrderToFranchise = async (orderId) => {
  try {
    const order = await Order.findById(orderId)
      .populate("shippingLocation")
      .populate("items.productId");
    if (!order) return;

    // Extract unique category IDs from order items
    const categoryIds = [
      ...new Set(
        order.items
          .map((item) => item.productId?.category?.toString())
          .filter((id) => id),
      ),
    ];

    const excludeIds = order.assignmentAttempts.map((a) => a.franchiseId);

    const coords = order?.shippingLocation?.coordinates;
    const hasValidCoords =
      Array.isArray(coords) &&
      coords.length >= 2 &&
      Number.isFinite(Number(coords[0])) &&
      Number.isFinite(Number(coords[1])) &&
      !(Number(coords[0]) === 0 && Number(coords[1]) === 0);

    if (!hasValidCoords) {
      console.warn(
        `[Assignment] Skipping order ${orderId}: invalid shipping coordinates`,
        coords,
      );
      return false;
    }

    // Convert GeoJSON [lng, lat] to { lat, lng }
    const location = {
      lat: Number(coords[1]),
      lng: Number(coords[0]),
    };

    const franchise = await findNearestFranchise(
      location,
      excludeIds,
      categoryIds,
    );

    if (franchise) {
      order.franchiseId = franchise._id;
      order.orderStatus = "Accepted";
      order.assignmentAttempts.push({
        franchiseId: franchise._id,
        attemptedAt: new Date(),
        reason: "auto-assigned",
      });

      // Add to history
      order.statusHistory.push({
        status: "Accepted",
        updatedAt: new Date(),
        updatedBy: "system",
      });

      await order.save();

      console.log(
        `[Assignment] Order ${orderId} auto-assigned to franchise ${franchise._id}. Triggering FCM + socket...`,
      );

      // Send Push Notification
      await sendNotificationToUser(
        franchise._id,
        {
          title: "New Order Auto-Assigned",
          body: `Order #${order._id.toString().slice(-6)} has been assigned to you. Prepare for packing!`,
          data: {
            type: "new_order",
            orderId: order._id.toString(),
            link: `/franchise/orders/${order._id}`,
          },
        },
        "franchise",
      );

      // Send Socket Real-time Notification
      emitToFranchise(franchise._id, "new_order", {
        orderId: order._id,
        message: `New Order Auto-Assigned: #${order._id.toString().slice(-6)}`,
      });

      console.log(
        `[Assignment Success] Order ${orderId} assigned to Franchise ${franchise.franchiseName || franchise._id}`,
      );
      return true;
    } else {
      console.warn(
        `[Assignment Failure] No eligible franchise found for order ${orderId} within 10km radius.`,
      );
      return false;
    }
  } catch (error) {
    console.error("Error assigning order to franchise:", error);
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
            coordinates: [lng, lat],
          },
          $maxDistance: 5000, // 5km
        },
      },
      status: "active",
      isOnline: true,
    });

    return nearestPartner;
  } catch (error) {
    console.error("Error finding nearest delivery partner:", error);
    return null;
  }
};

/**
 * Assigns an order to the nearest delivery partner
 * @param {String} orderId
 */
export const assignDeliveryToOrder = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate("franchiseId");
    if (!order || !order.franchiseId) return;

    const franchise = await Franchise.findById(order.franchiseId);
    if (!franchise) return;

    const location = {
      lat: franchise.location.coordinates[1],
      lng: franchise.location.coordinates[0],
    };

    console.log(
      "[Assignment] Looking for nearest delivery partner for order",
      orderId,
      "at location",
      location,
    );
    const partner = await findNearestDeliveryPartner(location);

    if (partner) {
      console.log("[Assignment] Nearest delivery partner found:", partner._id);
      order.deliveryPartnerId = partner._id;
      // Status remains Accepted or becomes Packed?
      // Usually assigned when packed or accepted.
      await order.save();

      // Send Notification (standardized payload for delivery assignment)
      await sendNotificationToUser(
        partner._id,
        {
          title: "New Delivery Task",
          body: `You have a new delivery task for order #${order._id.toString().slice(-6)}.`,
          data: {
            type: "new_delivery",
            notificationCategory: "assignment",
            source: "franchise",
            orderId: order._id.toString(),
            link: `/delivery/assignments/${order._id}`,
          },
        },
        "delivery",
      );

      // Send Socket Real-time Notification
      emitToDelivery(partner._id, "new_task", {
        orderId: order._id,
        type: "DELIVERY",
        message: `New delivery task assigned: #${order._id.toString().slice(-6)}`,
      });

      return true;
    }
    return false;
  } catch (error) {
    console.error("Error assigning delivery partner:", error);
    return false;
  }
};
