import { Router } from "express";
import { getRealtimeDatabase } from "../config/firebase.js";
import { authAdmin } from "../middleware/auth.js";

const router = Router();
router.use(authAdmin);

// GET /dashboard - Dashboard stats and recent orders
router.get("/dashboard", async (_req, res) => {
  try {
    const db = getRealtimeDatabase();

    // Fetch all required data nodes in parallel
    const [productsSnap, ordersSnap, customersSnap] = await Promise.all([
      db.ref("products").get(),
      db.ref("orders").get(),
      db.ref("customers").get(),
    ]);

    const products = productsSnap.exists() ? Object.values(productsSnap.val()) : [];
    const orders = ordersSnap.exists() ? Object.entries(ordersSnap.val()).map(([id, val]) => ({ id, ...val })) : [];
    const customers = customersSnap.exists() ? Object.values(customersSnap.val()) : [];

    // Calculate Stats
    const productCount = products.filter((p) => p.active !== false).length;
    const orderCount = orders.length;
    const customerCount = customers.length;
    const pendingOrders = orders.filter((o) => o.status === "pending").length;

    const totalRevenue = orders
      .filter((o) => o.paymentStatus === "paid")
      .reduce((sum, o) => sum + Number(o.total || 0), 0);

    // Get 8 most recent orders
    const recentOrders = [...orders]
      .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
      .slice(0, 8)
      .map((o) => ({
        id: o.id,
        orderId: o.orderId,
        customerName: o.customerName,
        total: o.total,
        status: o.status,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt,
      }));

    res.json({
      stats: {
        products: productCount,
        orders: orderCount,
        customers: customerCount,
        pendingOrders,
        revenue: totalRevenue,
      },
      recentOrders,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /customers - List all customer profiles
router.get("/customers", async (_req, res) => {
  try {
    const db = getRealtimeDatabase();
    const snapshot = await db.ref("customers").get();
    if (!snapshot.exists()) {
      return res.json([]);
    }

    const customers = Object.entries(snapshot.val())
      .map(([id, val]) => ({ id, ...val }))
      .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
      .slice(0, 100);

    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /coupons - List all discount coupons
router.get("/coupons", async (_req, res) => {
  try {
    const db = getRealtimeDatabase();
    const snapshot = await db.ref("coupons").get();
    if (!snapshot.exists()) {
      return res.json([]);
    }

    const coupons = Object.entries(snapshot.val())
      .map(([id, val]) => ({ id, ...val }))
      .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));

    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /coupons - Create discount coupon
router.post("/coupons", async (req, res) => {
  try {
    const db = getRealtimeDatabase();
    const couponsRef = db.ref("coupons");
    const newCouponRef = couponsRef.push();

    const coupon = {
      ...req.body,
      code: req.body.code?.toUpperCase(),
      usedCount: 0,
      active: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await newCouponRef.set(coupon);
    res.status(201).json({ id: newCouponRef.key, ...coupon });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /coupons/:id - Update coupon configuration
router.put("/coupons/:id", async (req, res) => {
  try {
    const db = getRealtimeDatabase();
    const couponRef = db.ref(`coupons/${req.params.id}`);

    const updates = {
      ...req.body,
      code: req.body.code?.toUpperCase(),
      updatedAt: Date.now(),
    };

    await couponRef.update(updates);
    res.json({ id: req.params.id, ...updates });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /reviews - List reviews with populated product info
router.get("/reviews", async (_req, res) => {
  try {
    const db = getRealtimeDatabase();
    
    const [reviewsSnap, productsSnap] = await Promise.all([
      db.ref("reviews").get(),
      db.ref("products").get(),
    ]);

    if (!reviewsSnap.exists()) {
      return res.json([]);
    }

    const products = productsSnap.exists() ? productsSnap.val() : {};
    
    const reviews = Object.entries(reviewsSnap.val())
      .map(([id, val]) => {
        const productVal = products[val.productId] || null;
        return {
          id,
          ...val,
          productId: productVal ? { id: val.productId, name: productVal.name } : { id: val.productId, name: "Unknown Product" },
        };
      })
      .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /reviews/:id - Approve/Disapprove reviews
router.patch("/reviews/:id", async (req, res) => {
  try {
    const db = getRealtimeDatabase();
    const reviewRef = db.ref(`reviews/${req.params.id}`);

    const updates = {
      approved: req.body.approved,
      updatedAt: Date.now(),
    };

    await reviewRef.update(updates);
    
    const snapshot = await reviewRef.get();
    res.json({ id: req.params.id, ...snapshot.val() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /payments - List e-shop payments
router.get("/payments", async (_req, res) => {
  try {
    const db = getRealtimeDatabase();
    const snapshot = await db.ref("orders").get();
    if (!snapshot.exists()) {
      return res.json([]);
    }

    const orders = Object.entries(snapshot.val())
      .map(([id, val]) => ({ id, ...val }))
      .filter((o) => o.paymentStatus === "paid" || o.paymentStatus === "pending")
      .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
      .slice(0, 50)
      .map((o) => ({
        id: o.id,
        orderId: o.orderId,
        total: o.total,
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod,
        customerName: o.customerName,
        createdAt: o.createdAt,
      }));

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
