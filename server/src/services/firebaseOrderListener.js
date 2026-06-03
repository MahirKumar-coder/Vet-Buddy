import { getRealtimeDatabase } from "../config/firebase.js";
import { syncOrderToSheets, syncAllOrdersToSheets } from "../services/orderSyncService.js";
import { sendMultiChannelNotification } from "./notificationService.js";

let ordersListener = null;

// Send Notification helper for e-shop orders
const notifyOrder = async (order) => {
  try {
    const itemsListHtml = (order.items || [])
      .map(
        (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #334155;">${item.name || item.productName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #334155; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #334155; text-align: right;">₹${item.price}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #0f172a; font-weight: bold; text-align: right;">₹${Number(item.price) * Number(item.quantity)}</td>
      </tr>
    `
      )
      .join("");

    const address = order.shippingAddress || {};
    const addressStr = `${address.line1 || ""}, ${address.line2 ? address.line2 + ", " : ""}${address.city || ""}, ${address.state || ""} - ${address.pincode || ""}`;

    // 🛍️ E-Shop Order Alerts
    const customerSubject = `Order Confirmed: #${order.orderId} - Vet Buddy Shop 🛍️`;
    const customerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #0ea5e9; text-align: center; margin-top: 0;">Vet Buddy Patna</h2>
        <h3 style="color: #16a34a; text-align: center; margin-bottom: 25px;">🎉 Your Order is Confirmed!</h3>
        <p>Hi <strong>${order.customerName}</strong>,</p>
        <p>Thank you for shopping with us! We have received your payment and confirmed your order <strong>#${order.orderId}</strong>.</p>
        
        <h4 style="color: #0f172a; border-bottom: 2px solid #38bdf8; padding-bottom: 6px; margin-top: 25px;">Items Ordered:</h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f8fafc;">
              <th style="padding: 8px; text-align: left; font-size: 12px; color: #64748b; border-bottom: 1px solid #cbd5e1;">Item Name</th>
              <th style="padding: 8px; text-align: center; font-size: 12px; color: #64748b; border-bottom: 1px solid #cbd5e1;">Qty</th>
              <th style="padding: 8px; text-align: right; font-size: 12px; color: #64748b; border-bottom: 1px solid #cbd5e1;">Price</th>
              <th style="padding: 8px; text-align: right; font-size: 12px; color: #64748b; border-bottom: 1px solid #cbd5e1;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsListHtml}
          </tbody>
        </table>

        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; font-size: 14px;">
            <tr><td style="color: #64748b; padding: 3px 0;">Subtotal:</td><td style="text-align: right; color: #334155;">₹${order.subtotal || order.totalAmount}</td></tr>
            ${order.discount ? `<tr><td style="color: #ef4444; padding: 3px 0;">Discount:</td><td style="text-align: right; color: #ef4444;">-₹${order.discount}</td></tr>` : ""}
            <tr style="font-weight: bold; font-size: 16px;"><td style="color: #0f172a; padding: 8px 0 0 0; border-top: 1px dashed #cbd5e1;">Total Amount:</td><td style="text-align: right; color: #0ea5e9; padding: 8px 0 0 0; border-top: 1px dashed #cbd5e1;">₹${order.totalAmount}</td></tr>
          </table>
        </div>

        <div style="border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 8px 0; color: #334155;">Delivery Address:</h4>
          <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.5;">
            <strong>${order.customerName}</strong><br/>
            ${addressStr}<br/>
            Phone: ${order.customerPhone}
          </p>
        </div>

        <p style="font-size: 14px; color: #334155; line-height: 1.5;">
          We are preparing your package for shipment. We will send you another update with the tracking details once it ships!
        </p>
        <p style="margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 15px; font-size: 12px; color: #64748b; text-align: center;">
          Vet Buddy Pet Shop, Patna. Thank you for your support! 🐾
        </p>
      </div>
    `;

    const adminSubject = `🛍️ NEW ORDER RECEIVED: #${order.orderId}`;
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #cbd5e1; border-radius: 12px; background-color: #f0fdf4;">
        <h2 style="color: #15803d; margin-top: 0;">🛍️ New Order Placed & Confirmed!</h2>
        <p>Order <strong>#${order.orderId}</strong> has been successfully placed by <strong>${order.customerName}</strong>.</p>
        
        <h4 style="margin: 15px 0 8px 0;">Ordered Items:</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 15px;">
          <tr style="background-color: #e2e8f0;"><th style="padding: 4px; text-align: left;">Item</th><th style="padding: 4px; text-align: center;">Qty</th><th style="padding: 4px; text-align: right;">Total</th></tr>
          ${(order.items || [])
            .map(
              (i) =>
                `<tr><td style="padding: 4px; border-bottom: 1px solid #e2e8f0;">${i.name || i.productName}</td><td style="padding: 4px; border-bottom: 1px solid #e2e8f0; text-align: center;">${i.quantity}</td><td style="padding: 4px; border-bottom: 1px solid #e2e8f0; text-align: right;">₹${Number(i.price) * Number(i.quantity)}</td></tr>`
            )
            .join("")}
        </table>
        
        <p><strong>Order Summary:</strong><br/>
        Total Amount: ₹${order.totalAmount}<br/>
        Payment Method: ${order.paymentMethod || "online"}<br/>
        Customer Phone: ${order.customerPhone}<br/>
        Customer Email: ${order.customerEmail || "Not provided"}</p>
        
        <p><strong>Shipping Details:</strong><br/>
        ${addressStr}</p>
      </div>
    `;

    // Trigger Email notifications
    await sendMultiChannelNotification({
      customerEmail: order.customerEmail || "",
      customerSubject,
      customerHtml,
      adminSubject,
      adminHtml,
    });

    // Mark as notified in Firebase Realtime Database
    const db = getRealtimeDatabase();
    await db.ref(`orders/${order.id}`).update({
      notificationSent: true,
      updatedAt: Date.now(),
    });

    console.log(`✉️/📱 E-Shop confirmation notifications sent for order: ${order.orderId}`);
  } catch (err) {
    console.error(`❌ Failed to send notifications for order ${order.orderId}:`, err.message);
  }
};

// Set up real-time listener for orders from Realtime Database
export const setupOrdersListener = async () => {
  try {
    console.log("🔍 Setting up orders listener (Realtime Database)...");
    
    const db = getRealtimeDatabase();
    const ordersRef = db.ref("orders");

    // Listen to new orders
    ordersRef.on(
      "child_added",
      async (snapshot) => {
        try {
          const orderId = snapshot.key;
          const orderData = snapshot.val();

          if (!orderId || !orderData) {
            console.warn("⚠️ Invalid order snapshot");
            return;
          }

          console.log(`📦 New order detected: ${orderId}`);

          const normalizedOrder = {
            id: orderId,
            orderId: orderData.orderId || orderId,
            customerId: orderData.customerId || "",
            customerName: orderData.customerName || "",
            customerEmail: orderData.customerEmail || "",
            customerPhone: orderData.customerPhone || "",
            items: orderData.items || [],
            shippingAddress: orderData.shippingAddress || {},
            subtotal: orderData.subtotal || 0,
            tax: orderData.tax || 0,
            deliveryCharge: orderData.deliveryCharge || 0,
            totalAmount: orderData.totalAmount || 0,
            couponCode: orderData.couponCode || "",
            status: orderData.status || "pending",
            paymentMethod: orderData.paymentMethod || "upi",
            createdAt: orderData.createdAt || Date.now(),
            updatedAt: orderData.updatedAt || Date.now(),
          };

          // 1. Sync to Google Sheets
          await syncOrderToSheets(normalizedOrder);

          // 2. Trigger notifications if order is paid immediately
          if (
            (orderData.status === "paid" || orderData.status === "confirmed" || orderData.paymentStatus === "paid") &&
            orderData.notificationSent !== true
          ) {
            await notifyOrder(normalizedOrder);
          }
        } catch (error) {
          console.error("❌ Error in orders listener child_added handler:", error.message);
        }
      },
      (error) => {
        console.error("❌ Error in orders listener (child_added):", error.message);
      }
    );

    // Listen for order updates (detects payment confirmations)
    ordersRef.on(
      "child_changed",
      async (snapshot) => {
        try {
          const orderId = snapshot.key;
          const orderData = snapshot.val();

          if (!orderId || !orderData) return;

          console.log(`📦 Order updated: ${orderId}`);

          const normalizedOrder = {
            id: orderId,
            orderId: orderData.orderId || orderId,
            customerId: orderData.customerId || "",
            customerName: orderData.customerName || "",
            customerEmail: orderData.customerEmail || "",
            customerPhone: orderData.customerPhone || "",
            items: orderData.items || [],
            shippingAddress: orderData.shippingAddress || {},
            subtotal: orderData.subtotal || 0,
            tax: orderData.tax || 0,
            deliveryCharge: orderData.deliveryCharge || 0,
            totalAmount: orderData.totalAmount || 0,
            couponCode: orderData.couponCode || "",
            status: orderData.status || "pending",
            paymentMethod: orderData.paymentMethod || "upi",
            createdAt: orderData.createdAt || Date.now(),
            updatedAt: orderData.updatedAt || Date.now(),
          };

          // 1. Sync to Google Sheets
          await syncOrderToSheets(normalizedOrder);

          // 2. Trigger notifications if status shifts to confirmed/paid
          if (
            (orderData.status === "paid" || orderData.status === "confirmed" || orderData.paymentStatus === "paid") &&
            orderData.notificationSent !== true
          ) {
            await notifyOrder(normalizedOrder);
          }
        } catch (error) {
          console.error("❌ Error in orders listener child_changed handler:", error.message);
        }
      },
      (error) => {
        console.error("❌ Error in orders listener (child_changed):", error.message);
      }
    );

    console.log("✅ Orders listener setup complete");
  } catch (error) {
    console.error("❌ Error setting up orders listener:", error.message);
  }
};

// Sync all existing orders on startup
export const syncExistingOrders = async () => {
  try {
    console.log("📊 Syncing existing orders from Realtime Database...");
    
    const db = getRealtimeDatabase();
    const ordersRef = db.ref("orders");

    const snapshot = await ordersRef.get();

    if (!snapshot.exists()) {
      console.log("✅ No existing orders to sync");
      return;
    }

    const ordersData = snapshot.val();
    const orders = Object.entries(ordersData).map(([id, data]) => ({
      id,
      ...data,
    }));

    if (orders.length > 0) {
      await syncAllOrdersToSheets(orders);
      console.log(`✅ Synced ${orders.length} existing orders to Google Sheets`);
    }
  } catch (error) {
    console.error("❌ Error syncing existing orders:", error.message);
  }
};

// Clean up listener
export const stopOrdersListener = () => {
  if (ordersListener) {
    const db = getRealtimeDatabase();
    db.ref("orders").off();
    console.log("✅ Orders listener stopped");
  }
};

export default {
  setupOrdersListener,
  syncExistingOrders,
  stopOrdersListener,
};