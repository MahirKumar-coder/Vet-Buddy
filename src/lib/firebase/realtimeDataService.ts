import {
  ref,
  set,
  get,
  update,
  onValue,
  off,
} from "firebase/database";
import { realtimeDb } from "@/firebase/firebase";

export interface InventoryItem {
  productId: string;
  quantity: number;
  lastUpdated?: number;
}

export interface ActivityLog {
  id?: string;
  timestamp: number;
  userId: string;
  action: string;
  description: string;
  details?: Record<string, any>;
}

// Update inventory in real-time
export const updateInventory = async (
  productId: string,
  quantity: number
): Promise<void> => {
  try {
    await update(ref(realtimeDb, `inventory/${productId}`), {
      quantity,
      lastUpdated: Date.now(),
    });
  } catch (error) {
    console.error("Error updating inventory:", error);
    throw error;
  }
};

// Get inventory item
export const getInventoryItem = async (
  productId: string
): Promise<InventoryItem | null> => {
  try {
    const inventoryRef = ref(realtimeDb, `inventory/${productId}`);
    const snapshot = await get(inventoryRef);
    if (snapshot.exists()) {
      return snapshot.val() as InventoryItem;
    }
    return null;
  } catch (error) {
    console.error("Error fetching inventory item:", error);
    throw error;
  }
};

// Get all inventory
export const getAllInventory = async (): Promise<Record<string, InventoryItem>> => {
  try {
    const inventoryRef = ref(realtimeDb, "inventory");
    const snapshot = await get(inventoryRef);
    if (snapshot.exists()) {
      return snapshot.val() as Record<string, InventoryItem>;
    }
    return {};
  } catch (error) {
    console.error("Error fetching all inventory:", error);
    throw error;
  }
};

// Listen to inventory in real-time
export const listenToInventory = (
  productId: string,
  callback: (inventory: InventoryItem | null) => void
): (() => void) => {
  const inventoryRef = ref(realtimeDb, `inventory/${productId}`);
  onValue(inventoryRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as InventoryItem);
    } else {
      callback(null);
    }
  });

  return () => off(inventoryRef);
};

// Increment inventory
export const incrementInventory = async (
  productId: string,
  amount: number
): Promise<void> => {
  try {
    const item = await getInventoryItem(productId);
    const currentQuantity = item?.quantity || 0;
    await updateInventory(productId, currentQuantity + amount);
  } catch (error) {
    console.error("Error incrementing inventory:", error);
    throw error;
  }
};

// Decrement inventory
export const decrementInventory = async (
  productId: string,
  amount: number
): Promise<void> => {
  try {
    const item = await getInventoryItem(productId);
    const currentQuantity = item?.quantity || 0;
    await updateInventory(productId, Math.max(0, currentQuantity - amount));
  } catch (error) {
    console.error("Error decrementing inventory:", error);
    throw error;
  }
};

// Log activity
export const logActivity = async (activity: ActivityLog): Promise<void> => {
  try {
    const activityRef = ref(realtimeDb, `activity_logs/${Date.now()}`);
    await set(activityRef, {
      ...activity,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error logging activity:", error);
    throw error;
  }
};

// Get activity logs for user
export const getUserActivityLogs = async (userId: string): Promise<ActivityLog[]> => {
  try {
    const logsRef = ref(realtimeDb, "activity_logs");
    const snapshot = await get(logsRef);
    if (snapshot.exists()) {
      return Object.entries(snapshot.val())
        .map(([id, log]: [string, any]) => ({ id, ...log } as ActivityLog))
        .filter((log) => log.userId === userId)
        .sort((a, b) => b.timestamp - a.timestamp);
    }
    return [];
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    throw error;
  }
};

// Get all activity logs
export const getAllActivityLogs = async (): Promise<ActivityLog[]> => {
  try {
    const logsRef = ref(realtimeDb, "activity_logs");
    const snapshot = await get(logsRef);
    if (snapshot.exists()) {
      return Object.entries(snapshot.val())
        .map(([id, log]: [string, any]) => ({ id, ...log } as ActivityLog))
        .sort((a, b) => b.timestamp - a.timestamp);
    }
    return [];
  } catch (error) {
    console.error("Error fetching all activity logs:", error);
    throw error;
  }
};

// Listen to activity logs in real-time
export const listenToActivityLogs = (
  callback: (logs: ActivityLog[]) => void
): (() => void) => {
  const logsRef = ref(realtimeDb, "activity_logs");
  onValue(logsRef, (snapshot) => {
    if (snapshot.exists()) {
      const logs = Object.entries(snapshot.val())
        .map(([id, log]: [string, any]) => ({ id, ...log } as ActivityLog))
        .sort((a, b) => b.timestamp - a.timestamp);
      callback(logs);
    } else {
      callback([]);
    }
  });

  return () => off(logsRef);
};
