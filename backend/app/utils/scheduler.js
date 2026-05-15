import Order from '../models/order.js';
import { sendNotificationToUser } from './pushNotificationHelper.js';

/**
 * Parses delivery shift string like "6 AM - 8 AM" and returns start hour
 * @param {String} shift 
 * @returns {Number|null}
 */
function getShiftStartHour(shift) {
    if (!shift) return null;
    const match = shift.match(/(\d+)\s*(AM|PM)/i);
    if (!match) return null;
    
    let hour = parseInt(match[1]);
    const ampm = match[2].toUpperCase();
    
    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    
    return hour;
}

/**
 * Checks for upcoming scheduled orders and sends reminders to delivery partners
 */
export const checkScheduledReminders = async () => {
    try {
        const now = new Date();
        const todayStr = now.toDateString();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Find orders for today that haven't been delivered/cancelled
        const upcomingOrders = await Order.find({
            isPreOrder: true,
            orderStatus: { $in: ['Dispatched', 'Packed', 'Accepted', 'Placed'] },
            deliveryPartnerId: { $exists: true, $ne: null }
        });

        for (const order of upcomingOrders) {
            if (!order.scheduledDate) continue;
            
            const orderDate = new Date(order.scheduledDate);
            if (orderDate.toDateString() !== todayStr) continue;

            const startHour = getShiftStartHour(order.deliveryShift);
            if (startHour === null) continue;

            // Send reminder 30 minutes before shift starts
            // e.g. if shift starts at 8 AM, remind at 7:30 AM
            const minutesUntilStart = (startHour * 60) - (currentHour * 60 + currentMinute);

            // We only want to send the reminder once in a specific window (e.g. between 30 and 45 mins before)
            if (minutesUntilStart > 0 && minutesUntilStart <= 45) {
                console.log(`[Scheduler] Sending reminder for order ${order._id} to partner ${order.deliveryPartnerId}`);
                
                await sendNotificationToUser(order.deliveryPartnerId, {
                    title: "Upcoming Delivery Reminder",
                    body: `You have a scheduled delivery for ${order.deliveryShift} today. Please be ready!`,
                    data: {
                        type: 'scheduled_reminder',
                        orderId: order._id.toString(),
                        shift: order.deliveryShift
                    }
                }, 'delivery');
            }
        }
    } catch (error) {
        console.error('[Scheduler] Error in checkScheduledReminders:', error);
    }
};

/**
 * Starts the reminder scheduler
 */
export const startScheduler = () => {
    console.log('[Scheduler] Reminder scheduler started (every 15 minutes)');
    // Run every 15 minutes
    setInterval(checkScheduledReminders, 15 * 60 * 1000);
    
    // Also run once immediately on start
    checkScheduledReminders();
};
