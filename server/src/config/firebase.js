import admin from "firebase-admin";

const initializeFirebaseAdmin = () => {
  if (!admin.apps.length) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}");
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_REALTIME_DB_URL,
      });
      
      console.log("✅ Firebase Admin SDK initialized successfully");
    } catch (error) {
      console.error("❌ Error initializing Firebase Admin:", error.message);
    }
  }
};

export const getRealtimeDatabase = () => {
  initializeFirebaseAdmin();
  return admin.database();
};

// ==========================================
// ADMIN DB HELPERS
// ==========================================
export const getAdminFromDB = async (email) => {
  const db = getRealtimeDatabase();
  const snapshot = await db.ref("admins").get();
  if (!snapshot.exists()) return null;
  const admins = snapshot.val();
  return Object.entries(admins)
    .map(([id, val]) => ({ id, ...val }))
    .find((admin) => admin.email?.toLowerCase() === email?.toLowerCase()) || null;
};

export const getAdminByIdFromDB = async (id) => {
  const db = getRealtimeDatabase();
  const snapshot = await db.ref(`admins/${id}`).get();
  return snapshot.exists() ? { id, ...snapshot.val() } : null;
};

// ==========================================
// PRODUCT DB HELPERS
// ==========================================
export const getProductsFromDB = async () => {
  const db = getRealtimeDatabase();
  const snapshot = await db.ref("products").get();
  if (!snapshot.exists()) return [];
  return Object.entries(snapshot.val()).map(([id, val]) => ({ id, ...val }));
};

export const getProductFromDB = async (idOrSlug) => {
  const db = getRealtimeDatabase();
  // Try ID first
  const snapshot = await db.ref(`products/${idOrSlug}`).get();
  if (snapshot.exists() && snapshot.val().active !== false) {
    return { id: idOrSlug, ...snapshot.val() };
  }
  // Lookup by slug
  const all = await getProductsFromDB();
  return all.find((p) => (p.slug === idOrSlug || p.id === idOrSlug) && p.active !== false) || null;
};

// ==========================================
// CATEGORY DB HELPERS
// ==========================================
export const getCategoriesFromDB = async () => {
  const db = getRealtimeDatabase();
  const snapshot = await db.ref("categories").get();
  if (!snapshot.exists()) return [];
  return Object.entries(snapshot.val()).map(([id, val]) => ({ id, ...val }));
};

// ==========================================
// COUPON DB HELPERS
// ==========================================
export const getCouponsFromDB = async () => {
  const db = getRealtimeDatabase();
  const snapshot = await db.ref("coupons").get();
  if (!snapshot.exists()) return [];
  return Object.entries(snapshot.val()).map(([id, val]) => ({ id, ...val }));
};

export const getCouponByCodeFromDB = async (code) => {
  const db = getRealtimeDatabase();
  const snapshot = await db.ref("coupons").get();
  if (!snapshot.exists()) return null;
  return Object.entries(snapshot.val())
    .map(([id, val]) => ({ id, ...val }))
    .find((c) => c.code?.toUpperCase() === code?.toUpperCase()) || null;
};

// ==========================================
// CUSTOMER DB HELPERS
// ==========================================
export const getCustomersFromDB = async () => {
  const db = getRealtimeDatabase();
  const snapshot = await db.ref("customers").get();
  if (!snapshot.exists()) return [];
  return Object.entries(snapshot.val()).map(([id, val]) => ({ id, ...val }));
};

export const getCustomerByPhoneFromDB = async (phone) => {
  const db = getRealtimeDatabase();
  const snapshot = await db.ref("customers").get();
  if (!snapshot.exists()) return null;
  return Object.entries(snapshot.val())
    .map(([id, val]) => ({ id, ...val }))
    .find((c) => c.phone === phone) || null;
};

// ==========================================
// ORDER DB HELPERS
// ==========================================
export const getOrdersFromDB = async () => {
  const db = getRealtimeDatabase();
  const snapshot = await db.ref("orders").get();
  if (!snapshot.exists()) return [];
  return Object.entries(snapshot.val()).map(([id, val]) => ({ id, ...val }));
};

export const getOrderFromDB = async (orderId) => {
  const db = getRealtimeDatabase();
  // Try pushing ID
  const snapshot = await db.ref(`orders/${orderId}`).get();
  if (snapshot.exists()) {
    return { id: orderId, ...snapshot.val() };
  }
  // Lookup by custom orderId VBxxx
  const all = await getOrdersFromDB();
  return all.find((o) => o.orderId === orderId || o.id === orderId) || null;
};

export const updateOrderInDB = async (orderId, updates) => {
  const db = getRealtimeDatabase();
  // We need to resolve key first
  const order = await getOrderFromDB(orderId);
  if (!order) throw new Error("Order not found");
  
  await db.ref(`orders/${order.id}`).update({
    ...updates,
    updatedAt: admin.database.ServerValue.TIMESTAMP,
  });
  return order.id;
};

// ==========================================
// APPOINTMENT DB HELPERS
// ==========================================
export const getAppointmentFromDB = async (appointmentId) => {
  const db = getRealtimeDatabase();
  const snapshot = await db.ref(`appointments/${appointmentId}`).get();
  return snapshot.exists() ? { id: appointmentId, ...snapshot.val() } : null;
};

export const getAllAppointmentsFromDB = async () => {
  const db = getRealtimeDatabase();
  const snapshot = await db.ref("appointments").get();
  if (!snapshot.exists()) return [];
  return Object.entries(snapshot.val()).map(([id, appointment]) => ({
    id,
    ...appointment,
  }));
};

export const createAppointmentInDB = async (appointmentData) => {
  const db = getRealtimeDatabase();
  const appointmentRef = db.ref("appointments").push();
  await appointmentRef.set({
    ...appointmentData,
    createdAt: admin.database.ServerValue.TIMESTAMP,
    updatedAt: admin.database.ServerValue.TIMESTAMP,
  });
  return appointmentRef.key;
};

export const updateAppointmentInDB = async (appointmentId, updates) => {
  const db = getRealtimeDatabase();
  await db.ref(`appointments/${appointmentId}`).update({
    ...updates,
    updatedAt: admin.database.ServerValue.TIMESTAMP,
  });
};

export default {
  getRealtimeDatabase,
  getAdminFromDB,
  getAdminByIdFromDB,
  getProductsFromDB,
  getProductFromDB,
  getCategoriesFromDB,
  getCouponsFromDB,
  getCouponByCodeFromDB,
  getCustomersFromDB,
  getCustomerByPhoneFromDB,
  getOrdersFromDB,
  getOrderFromDB,
  updateOrderInDB,
  getAppointmentFromDB,
  getAllAppointmentsFromDB,
  createAppointmentInDB,
  updateAppointmentInDB,
};
