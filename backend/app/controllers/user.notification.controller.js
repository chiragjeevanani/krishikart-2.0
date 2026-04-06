import UserNotification from "../models/userNotification.js";
import { handleResponse } from "../utils/helper.js";
import { mapUserNotificationForViewer } from "../utils/userNotification.js";

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await UserNotification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(100);

    return handleResponse(res, 200, "User notifications fetched", {
      notifications: notifications.map(mapUserNotificationForViewer),
    });
  } catch (error) {
    console.error("Get user notifications error:", error);
    return handleResponse(res, 500, "Failed to fetch notifications");
  }
};

export const markUserNotificationRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await UserNotification.findOneAndUpdate(
      { _id: id, userId },
      { $set: { read: true, readAt: new Date() } },
      { new: true },
    );

    if (!notification) {
      return handleResponse(res, 404, "Notification not found");
    }

    return handleResponse(res, 200, "Notification marked as read", {
      notification: mapUserNotificationForViewer(notification),
    });
  } catch (error) {
    console.error("Mark user notification read error:", error);
    return handleResponse(res, 500, "Failed to mark notification as read");
  }
};

export const markAllUserNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await UserNotification.updateMany(
      { userId, read: false },
      { $set: { read: true, readAt: new Date() } },
    );

    return handleResponse(res, 200, "All notifications marked as read");
  } catch (error) {
    console.error("Mark all user notifications read error:", error);
    return handleResponse(res, 500, "Failed to mark all notifications as read");
  }
};
