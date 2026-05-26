import {
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  off,
  push,
} from "firebase/database";
import { realtimeDb } from "@/firebase/firebase";

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  tax: number;
  deliveryCharge: number;
  totalAmount: number;
  couponCode?: string;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  orderId: string; // Backend order ID
  notes?: string;
  createdAt?: number;
  updatedAt?: number;
}

// Create order
export const createOrder = async (order: Order): Promise<string> => {
  try {
    const ordersRef = ref(realtimeDb, "orders");
    const newOrderRef = push(ordersRef);
    await set(newOrderRef, {
      ...order,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    console.log("✅ Order saved to Firebase:", newOrderRef.key);
    return newOrderRef.key!;
  } catch (error) {
    console.error("❌ Error creating order:", error);
    throw error;
  }
};

// Get single order
export const getOrder = async (orderId: string): Promise<Order | null> => {
  try {
    const orderRef = ref(realtimeDb, `orders/${orderId}`);
    const snapshot = await get(orderRef);
    if (snapshot.exists()) {
      return { id: orderId, ...snapshot.val() } as Order;
    }
    return null;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
};

// Get all orders
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const ordersRef = ref(realtimeDb, "orders");
    const snapshot = await get(ordersRef);
    if (snapshot.exists()) {
      const allOrders = snapshot.val();
      return Object.entries(allOrders)
        .map(([id, order]: [string, any]) => ({ id, ...order } as Order))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }
    return [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

// Get customer orders
export const getCustomerOrders = async (customerId: string): Promise<Order[]> => {
  try {
    const ordersRef = ref(realtimeDb, "orders");
    const snapshot = await get(ordersRef);
    if (snapshot.exists()) {
      const allOrders = snapshot.val();
      return Object.entries(allOrders)
        .filter(([, order]: [string, any]) => order.customerId === customerId)
        .map(([id, order]: [string, any]) => ({ id, ...order } as Order))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }
    return [];
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    throw error;
  }
};

// Listen to orders in real-time
export const listenToOrders = (
  callback: (orders: Order[]) => void
): (() => void) => {
  const ordersRef = ref(realtimeDb, "orders");
  onValue(ordersRef, (snapshot) => {
    if (snapshot.exists()) {
      const allOrders = snapshot.val();
      const orders = Object.entries(allOrders)
        .map(([id, order]: [string, any]) => ({ id, ...order } as Order))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      callback(orders);
    } else {
      callback([]);
    }
  });

  return () => off(ordersRef);
};

// Update order status
export const updateOrderStatus = async (
  orderId: string,
  status: Order["status"]
): Promise<void> => {
  try {
    await update(ref(realtimeDb, `orders/${orderId}`), {
      status,
      updatedAt: Date.now(),
    });
    console.log("✅ Order status updated:", orderId, status);
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// Mark order as paid
export const markOrderAsPaid = async (orderId: string): Promise<void> => {
  try {
    await update(ref(realtimeDb, `orders/${orderId}`), {
      status: "paid",
      updatedAt: Date.now(),
    });
    console.log("✅ Order marked as paid:", orderId);
  } catch (error) {
    console.error("Error marking order as paid:", error);
    throw error;
  }
};

// Update order
export const updateOrder = async (
  orderId: string,
  updates: Partial<Order>
): Promise<void> => {
  try {
    await update(ref(realtimeDb, `orders/${orderId}`), {
      ...updates,
      updatedAt: Date.now(),
    });
    console.log("✅ Order updated:", orderId);
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
};

// Delete order
export const deleteOrder = async (orderId: string): Promise<void> => {
  try {
    await remove(ref(realtimeDb, `orders/${orderId}`));
    console.log("✅ Order deleted:", orderId);
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
};

export default {
  createOrder,
  getOrder,
  getAllOrders,
  getCustomerOrders,
  listenToOrders,
  updateOrderStatus,
  markOrderAsPaid,
  updateOrder,
  deleteOrder,
};
