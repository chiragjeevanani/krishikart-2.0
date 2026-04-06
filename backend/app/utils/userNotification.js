import UserNotification from "../models/userNotification.js";
import { emitToUser } from "../lib/socket.js";

const formatNotification = (notification) => ({
  id: notification._id.toString(),
  type: notification.type,
  title: notification.title,
  message: notification.message,
  link: notification.link || "",
  meta: notification.meta || {},
  createdAt: notification.createdAt,
  read: !!notification.read,
});

export const createUserNotification = async ({
  userId,
  type = "general",
  title,
  message,
  link = "",
  meta = {},
}) => {
  if (!userId || !title || !message) return null;

  try {
    const notification = await UserNotification.create({
      userId,
      type,
      title,
      message,
      link,
      meta,
    });

    emitToUser(userId, "user_notification", formatNotification(notification));
    return notification;
  } catch (error) {
    console.error("Create user notification error:", error);
    return null;
  }
};

export const mapUserNotificationForViewer = (notification) =>
  formatNotification(notification);
