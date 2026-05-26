import {
  ref,
  set,
  get,
  update,
  onValue,
  off,
} from "firebase/database";
import { realtimeDb } from "@/firebase/firebase";

export interface Notification {
  id?: string;
  userId: string;
  type: "order" | "appointment" | "system" | "promo";
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, any>;
  timestamp?: number;
}

// Create notification
export const createNotification = async (notification: Notification): Promise<void> => {
  try {
    const notificationRef = ref(
      realtimeDb,
      `notifications/${notification.userId}/${Date.now()}`
    );
    await set(notificationRef, {
      ...notification,
      isRead: false,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Get all notifications for user
export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const notificationsRef = ref(realtimeDb, `notifications/${userId}`);
    const snapshot = await get(notificationsRef);
    if (snapshot.exists()) {
      return Object.entries(snapshot.val())
        .map(([id, notif]: [string, any]) => ({ id, ...notif } as Notification))
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }
    return [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

// Get unread notifications count
export const getUnreadNotificationsCount = async (userId: string): Promise<number> => {
  try {
    const notifications = await getUserNotifications(userId);
    return notifications.filter((notif) => !notif.isRead).length;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }
};

// Listen to notifications in real-time
export const listenToNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void
): (() => void) => {
  const notificationsRef = ref(realtimeDb, `notifications/${userId}`);
  onValue(notificationsRef, (snapshot) => {
    if (snapshot.exists()) {
      const notifications = Object.entries(snapshot.val())
        .map(([id, notif]: [string, any]) => ({ id, ...notif } as Notification))
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      callback(notifications);
    } else {
      callback([]);
    }
  });

  return () => off(notificationsRef);
};

// Mark notification as read
export const markNotificationAsRead = async (
  userId: string,
  notificationId: string
): Promise<void> => {
  try {
    await update(ref(realtimeDb, `notifications/${userId}/${notificationId}`), {
      isRead: true,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const notifications = await getUserNotifications(userId);
    const updates: Record<string, boolean> = {};

    notifications.forEach((notif) => {
      updates[`notifications/${userId}/${notif.id}/isRead`] = true;
    });

    if (Object.keys(updates).length > 0) {
      const updateRef = ref(realtimeDb);
      await update(updateRef, updates);
    }
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

// Clear all notifications
export const clearAllNotifications = async (userId: string): Promise<void> => {
  try {
    const notificationsRef = ref(realtimeDb, `notifications/${userId}`);
    await set(notificationsRef, null);
  } catch (error) {
    console.error("Error clearing notifications:", error);
    throw error;
  }
};

// Send bulk notification to multiple users
export const sendBulkNotification = async (
  userIds: string[],
  notification: Omit<Notification, "userId">
): Promise<void> => {
  try {
    const updates: Record<string, any> = {};

    userIds.forEach((userId) => {
      const timestamp = Date.now();
      updates[`notifications/${userId}/${timestamp}`] = {
        ...notification,
        userId,
        isRead: false,
        timestamp,
      };
    });

    const updateRef = ref(realtimeDb);
    await update(updateRef, updates);
  } catch (error) {
    console.error("Error sending bulk notification:", error);
    throw error;
  }
};
