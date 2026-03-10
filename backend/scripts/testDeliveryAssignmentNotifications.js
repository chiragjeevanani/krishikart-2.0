import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "../app/models/order.js";
import Delivery from "../app/models/delivery.js";
import { assignDeliveryToOrder } from "../app/utils/assignment.js";

dotenv.config();

async function main() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.DATABASE_URL;
    if (!mongoUri) {
      console.error("[TestDeliveryAssignment] Missing MONGO_URI/DATABASE_URL env variable");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("[TestDeliveryAssignment] Connected to MongoDB");

    const orderId = process.argv[2];
    if (!orderId) {
      console.error("Usage: node backend/scripts/testDeliveryAssignmentNotifications.js <orderId>");
      process.exit(1);
    }

    const order = await Order.findById(orderId);
    if (!order) {
      console.error(`[TestDeliveryAssignment] Order not found: ${orderId}`);
      process.exit(1);
    }

    console.log(`[TestDeliveryAssignment] Testing delivery assignment + FCM for Order ${orderId}`);

    const result = await assignDeliveryToOrder(orderId);
    console.log("[TestDeliveryAssignment] assignDeliveryToOrder result:", result);

    if (!result) {
      console.warn("[TestDeliveryAssignment] No delivery partner could be assigned. Check franchise/delivery locations and availability.");
    } else {
      const refreshedOrder = await Order.findById(orderId).populate("deliveryPartnerId");
      if (refreshedOrder?.deliveryPartnerId?._id) {
        const partner = await Delivery.findById(refreshedOrder.deliveryPartnerId._id);
        console.log(`[TestDeliveryAssignment] Assigned delivery partner: ${partner?.fullName || partner?._id}`);
        console.log("[TestDeliveryAssignment] Partner FCM tokens:", partner?.fcmTokens || []);
      }
      console.log("[TestDeliveryAssignment] Check server logs for FCM sendEachForMulticast success/failure counts.");
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("[TestDeliveryAssignment] Error during test run:", err);
    process.exit(1);
  }
}

main();

