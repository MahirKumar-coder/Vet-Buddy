import { Router } from "express";
import { getRealtimeDatabase } from "../config/firebase.js";
import { authAdmin } from "../middleware/auth.js";

const router = Router();

function generateOrderId() {
  return `VB${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

// POST / - Create a new order with coupon validation and customer tracking
router.post("/", async (req, res) => {
  try {
    const { customerName, phone, email, address, items, couponCode } = req.body;
    if (!items?.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const db = getRealtimeDatabase();
    
    let subtotal = items.reduce((s, i) => s + Number(i.price || 0) * Number(i.quantity || 1), 0);
    let discount = 0;

    // Validate Coupon
    if (couponCode) {
      const couponsSnapshot = await db.ref("coupons").get();
      if (couponsSnapshot.exists()) {
        const coupons = couponsSnapshot.val();
        const couponEntry = Object.entries(coupons).find(
          ([, c]) => c.code?.toUpperCase() === couponCode.toUpperCase() && c.active !== false
        );

        if (couponEntry) {
          const [couponId, coupon] = couponEntry;
          const usedCount = Number(coupon.usedCount || 0);
          const maxUses = Number(coupon.maxUses || 0);
          const minOrder = Number(coupon.minOrder || 0);

          if (usedCount < maxUses && subtotal >= minOrder) {
            discount =
              coupon.type === "percent"
                ? Math.round((subtotal * Number(coupon.value || 0)) / 100)
                : Number(coupon.value || 0);
            
            // Increment coupon used count in Firebase
            await db.ref(`coupons/${couponId}`).update({
              usedCount: usedCount + 1,
              updatedAt: Date.now(),
            });
          }
        }
      }
    }

    const total = Math.max(0, subtotal - discount);
    const customOrderId = generateOrderId();
    
    // Save Order to Firebase
    const orderRef = db.ref("orders").push();
    const order = {
      orderId: customOrderId,
      customerName,
      phone,
      email: email || "",
      address,
      items,
      subtotal,
      discount,
      total,
      couponCode: couponCode || "",
      status: "pending",
      paymentStatus: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await orderRef.set(order);

    // Sync / Upsert Customer profile in Firebase RTDB
    const customersSnapshot = await db.ref("customers").get();
    let customerKey = null;
    let customerData = null;

    if (customersSnapshot.exists()) {
      const customers = customersSnapshot.val();
      const customerEntry = Object.entries(customers).find(
        ([, c]) => c.phone === phone
      );
      if (customerEntry) {
        customerKey = customerEntry[0];
        customerData = customerEntry[1];
      }
    }

    if (!customerKey) {
      // Create new customer
      const newCustomerRef = db.ref("customers").push();
      await newCustomerRef.set({
        name: customerName,
        phone,
        email: email || "",
        addresses: address ? [address] : [],
        orderCount: 1,
        totalSpent: total,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } else {
      // Update existing customer
      const updatedAddresses = Array.isArray(customerData.addresses) ? [...customerData.addresses] : [];
      if (address && !updatedAddresses.some(addr => addr.line1 === address.line1 && addr.pincode === address.pincode)) {
        updatedAddresses.push(address);
      }
      
      await db.ref(`customers/${customerKey}`).update({
        orderCount: Number(customerData.orderCount || 0) + 1,
        totalSpent: Number(customerData.totalSpent || 0) + total,
        addresses: updatedAddresses,
        updatedAt: Date.now(),
      });
    }

    res.status(201).json({ id: orderRef.key, ...order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /:id/pay - Mark order as paid and confirmed
router.patch("/:id/pay", async (req, res) => {
  try {
    const db = getRealtimeDatabase();
    
    // Resolve order ID
    const ordersSnapshot = await db.ref("orders").get();
    let orderKey = req.params.id;
    let orderVal = null;
    
    if (ordersSnapshot.exists()) {
      const orders = ordersSnapshot.val();
      const orderEntry = Object.entries(orders).find(
        ([id, o]) => id === req.params.id || o.orderId === req.params.id
      );
      if (orderEntry) {
        orderKey = orderEntry[0];
        orderVal = orderEntry[1];
      }
    }

    if (!orderVal) {
      return res.status(404).json({ message: "Order not found" });
    }

    const updates = {
      paymentStatus: "paid",
      status: "confirmed",
      updatedAt: Date.now(),
    };

    await db.ref(`orders/${orderKey}`).update(updates);
    res.json({ id: orderKey, ...orderVal, ...updates });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET / - List all orders for Admin
router.get("/", authAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const db = getRealtimeDatabase();

    const snapshot = await db.ref("orders").get();
    if (!snapshot.exists()) {
      return res.json({ orders: [], total: 0 });
    }

    let orderList = Object.entries(snapshot.val()).map(([id, val]) => ({
      id,
      ...val,
    }));

    // Filter by status
    if (status) {
      orderList = orderList.filter((o) => o.status === status);
    }

    // Sort by newest
    orderList.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));

    // Paginate
    const total = orderList.length;
    const skip = (Number(page) - 1) * Number(limit);
    const paginatedOrders = orderList.slice(skip, skip + Number(limit));

    res.json({ orders: paginatedOrders, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /:id/status - Update shipping status of order
router.patch("/:id/status", authAdmin, async (req, res) => {
  try {
    const db = getRealtimeDatabase();
    
    // Resolve order ID
    const ordersSnapshot = await db.ref("orders").get();
    let orderKey = req.params.id;
    let orderVal = null;
    
    if (ordersSnapshot.exists()) {
      const orders = ordersSnapshot.val();
      const orderEntry = Object.entries(orders).find(
        ([id, o]) => id === req.params.id || o.orderId === req.params.id
      );
      if (orderEntry) {
        orderKey = orderEntry[0];
        orderVal = orderEntry[1];
      }
    }

    if (!orderVal) {
      return res.status(404).json({ message: "Order not found" });
    }

    const updates = {
      status: req.body.status,
      updatedAt: Date.now(),
    };

    await db.ref(`orders/${orderKey}`).update(updates);
    res.json({ id: orderKey, ...orderVal, ...updates });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
