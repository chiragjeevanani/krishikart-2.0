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

        if (!recipient) {
            console.warn(`[FCM] No recipient found for type=${userType}, id=${userId}`);
            return;
        }

        const webTokens = recipient.fcmTokens || [];
        const mobileTokens = recipient.mobile_fcm || [];
        const allTokens = [...webTokens, ...mobileTokens];

        console.log(`[FCM] Preparing notification for ${userType} ${userId}. WebTokens=${webTokens.length}, MobileTokens=${mobileTokens.length}`);

        if (allTokens.length === 0) {
            console.log(`[FCM] No FCM tokens found for ${userType} ${userId}, skipping send. Payload title="${payload.title}"`);
            return;
        }

        const message = {
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: payload.data || {},
            tokens: allTokens,
        };

        console.log(`[FCM] Sending multicast notification to ${userType} ${userId} with ${allTokens.length} tokens. Data=`, payload.data || {});
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`[FCM] sendEachForMulticast result for ${userType} ${userId}: success=${response.successCount}, failure=${response.failureCount}`);

        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(allTokens[idx]);
                    console.warn(`[FCM] Token send failure for ${userType} ${userId}: token=${allTokens[idx]}, error=${resp.error?.code}`);
                }
            });
            console.log('[FCM] Failed tokens to be cleaned:', failedTokens);

            // Remove failed tokens from both database arrays
            recipient.fcmTokens = webTokens.filter(t => !failedTokens.includes(t));
            recipient.mobile_fcm = mobileTokens.filter(t => !failedTokens.includes(t));
            await recipient.save();
            console.log(`[FCM] Cleaned failed tokens for ${userType} ${userId}. Remaining WebTokens=${recipient.fcmTokens.length}, MobileTokens=${recipient.mobile_fcm.length}`);
        }

        return response;
    } catch (error) {
        console.error(`Error sending push notification to ${userType} ${userId}:`, error);
    }
};
