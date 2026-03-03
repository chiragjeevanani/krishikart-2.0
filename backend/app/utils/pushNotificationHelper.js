import admin from '../services/firebaseAdmin.js';
import User from '../models/user.js';
import Franchise from '../models/franchise.js';
import Delivery from '../models/delivery.js';
import Vendor from '../models/vendor.js';

/**
 * Sends a push notification to a specific user by their ID and type
 * @param {String} userId 
 * @param {Object} payload {title, body, data}
 * @param {String} userType 'user', 'franchise', or 'delivery'
 */
export const sendNotificationToUser = async (userId, payload, userType = 'user') => {
    try {
        let recipient;
        if (userType === 'user') {
            recipient = await User.findById(userId);
        } else if (userType === 'franchise') {
            recipient = await Franchise.findById(userId);
        } else if (userType === 'delivery') {
            recipient = await Delivery.findById(userId);
        } else if (userType === 'vendor') {
            recipient = await Vendor.findById(userId);
        }

        if (!recipient || !recipient.fcmTokens || recipient.fcmTokens.length === 0) {
            console.log(`No FCM tokens found for ${userType} ${userId}`);
            return;
        }

        const message = {
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: payload.data || {},
            tokens: recipient.fcmTokens,
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`Successfully sent ${response.successCount} messages to ${userType} ${userId}`);

        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(recipient.fcmTokens[idx]);
                }
            });
            console.log('Failed tokens:', failedTokens);

            // Optional: Remove failed tokens from database
            recipient.fcmTokens = recipient.fcmTokens.filter(t => !failedTokens.includes(t));
            await recipient.save();
        }

        return response;
    } catch (error) {
        console.error(`Error sending push notification to ${userType}:`, error);
    }
};
