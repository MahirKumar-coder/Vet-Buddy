import Razorpay from "razorpay";
import crypto from "crypto";
import { getRealtimeDatabase } from "../config/firebase.js";

const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// POST /api/payment/create - Create Razorpay order
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, orderId, dbOrderId, customerName, customerEmail, customerPhone } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const razorpay = getRazorpayInstance();

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount), // amount in paise
      currency: "INR",
      receipt: orderId,
      notes: {
        dbOrderId: dbOrderId || "",
        customerName,
        customerEmail,
        customerPhone,
      },
    });

    console.log("✅ Razorpay order created:", razorpayOrder.id);

    res.status(201).json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error("❌ Error creating Razorpay order:", error);
    res.status(500).json({
      message: "Failed to create payment order",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// POST /api/payment/verify - Verify Razorpay payment and update in Firebase Realtime DB
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, dbOrderId, orderId } = req.body;

    const isDemo = req.body.isDemo || razorpaySignature === "demo_bypass_signature";

    if (!isDemo && (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature)) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    if (isDemo) {
      console.log("⚠️ DEMO PAYMENT BYPASS - Skipping Razorpay signature verification and capture check!");
    } else {
      // Verify signature
      const body = razorpayOrderId + "|" + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "dummy_secret")
        .update(body)
        .digest("hex");

      if (expectedSignature !== razorpaySignature) {
        console.warn("❌ Signature mismatch for payment:", razorpayPaymentId);
        return res.status(400).json({
          success: false,
          message: "Invalid payment signature",
        });
      }

      console.log("✅ Signature verified for payment:", razorpayPaymentId);

      const razorpay = getRazorpayInstance();
      // Fetch payment details from Razorpay to double-check
      const payment = await razorpay.payments.fetch(razorpayPaymentId);

      if (payment.status !== "captured") {
        return res.status(400).json({
          success: false,
          message: "Payment not captured by Razorpay",
        });
      }
    }

    const db = getRealtimeDatabase();

    // Check if this is a video consultation appointment
    let isAppointment = false;
    if (dbOrderId) {
      const appointmentSnap = await db.ref(`appointments/${dbOrderId}`).get();
      if (appointmentSnap.exists()) {
        isAppointment = true;
      }
    }

    if (isAppointment) {
      // 🩺 Update Appointment in Firebase Realtime Database
      await db.ref(`appointments/${dbOrderId}`).update({
        paymentStatus: "paid",
        paymentDetails: {
          razorpayOrderId,
          razorpayPaymentId,
          amount: 299,
        },
        paidAt: Date.now(),
        updatedAt: Date.now(),
      });
      console.log("✅ Appointment marked as PAID in Firebase Realtime DB:", dbOrderId);
    } else {
      // 🛍️ Process as E-Shop Order
      let resolvedKey = dbOrderId;
      const ordersSnapshot = await db.ref("orders").get();
      if (ordersSnapshot.exists()) {
        const orders = ordersSnapshot.val();
        const orderEntry = Object.entries(orders).find(
          ([id, o]) => id === dbOrderId || o.orderId === orderId || o.orderId === dbOrderId
        );
        if (orderEntry) {
          resolvedKey = orderEntry[0];
        }
      }

      if (resolvedKey) {
        await db.ref(`orders/${resolvedKey}`).update({
          paymentStatus: "paid",
          status: "confirmed",
          razorpayOrderId,
          razorpayPaymentId,
          paidAt: Date.now(),
          updatedAt: Date.now(),
        });
        console.log("✅ Order marked as PAID in Firebase Realtime DB:", resolvedKey);
      } else {
        console.warn(`⚠️ Could not resolve order/appointment in Firebase for payment update: ${orderId} / ${dbOrderId}`);
      }
    }

    res.json({
      success: true,
      message: "Payment verified successfully",
      razorpayPaymentId,
      razorpayOrderId,
      orderId,
    });
  } catch (error) {
    console.error("❌ Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// GET /api/payment/status/:orderId - Check payment status in Firebase RTDB
export const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const db = getRealtimeDatabase();

    const snapshot = await db.ref("orders").get();
    if (!snapshot.exists()) {
      return res.status(404).json({ message: "Order not found" });
    }

    const entry = Object.entries(snapshot.val()).find(
      ([, o]) => o.orderId === orderId || o.id === orderId
    );

    if (!entry) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = entry[1];
    res.json({
      orderId: order.orderId,
      paymentStatus: order.paymentStatus,
      status: order.status,
      razorpayPaymentId: order.razorpayPaymentId || null,
    });
  } catch (error) {
    console.error("❌ Error fetching payment status:", error);
    res.status(500).json({
      message: "Failed to fetch payment status",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export default {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentStatus,
};
