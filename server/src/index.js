import dotenv from "dotenv"; // Watch restart trigger
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { getRealtimeDatabase } from "./config/firebase.js";
import { configureCloudinary } from "./config/cloudinary.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import categoryRoutes from "./routes/categories.js";
import orderRoutes from "./routes/orders.js";
import uploadRoutes from "./routes/upload.js";
import adminRoutes from "./routes/admin.js";
import syncRoutes from "./routes/sync.js";
import paymentRoutes from "./routes/payment.js";
import { setupAppointmentsListener, syncExistingAppointments } from "./services/firebaseAppointmentListener.js";
import { setupOrdersListener, syncExistingOrders } from "./services/firebaseOrderListener.js";

dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  "JWT_SECRET",
  "FIREBASE_SERVICE_ACCOUNT",
  "FIREBASE_REALTIME_DB_URL",
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:", missingEnvVars.join(", "));
  console.error("📝 Please check your .env file and ensure all required variables are set.");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Security middleware - Allow local dev hosts, custom CLIENT_URL, and Vercel domains
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or diagnostic tools)
      if (!origin) return callback(null, true);
      
      const isAllowed = allowedOrigins.some(allowed => origin === allowed) || origin.endsWith(".vercel.app");
      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS blocked request from origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Serve static files (product images)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicPath = path.join(__dirname, "../../public");
app.use(express.static(publicPath));
console.log("📁 Serving static files from:", publicPath);

// Request logging (only in development)
if (NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`📍 ${req.method} ${req.path}`);
    next();
  });
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ 
    ok: true, 
    service: "vet-buddy-shop-api",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// Config endpoint
app.get("/api/config", (_req, res) => {
  res.json({
    upiId: process.env.UPI_ID || "vetbuddy@upi",
    siteName: "Vet Buddy",
    environment: NODE_ENV,
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/sync", syncRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found", path: req.path });
});

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error("❌ Error:", err.message);
  
  if (NODE_ENV === "development") {
    console.error(err.stack);
  }

  const status = err.status || 500;
  const message = NODE_ENV === "production" 
    ? "Internal server error" 
    : err.message || "Server error";

  res.status(status).json({ 
    message,
    ...(NODE_ENV === "development" && { error: err.stack })
  });
});

async function start() {
  try {
    // Initialize Firebase
    getRealtimeDatabase();
    console.log("✅ Firebase Realtime DB connected");

    // Configure Cloudinary
    configureCloudinary();
    console.log("✅ Cloudinary configured");
    
    // Initialize Firebase Listeners for Google Sheets sync
    console.log("\n🔥 Initializing Firebase Listeners for Google Sheets sync...");
    
    try {
      // Sync existing data on startup
      await syncExistingAppointments();
      await syncExistingOrders();
      
      // Setup real-time listeners
      await setupAppointmentsListener();
      await setupOrdersListener();
      
      console.log("✅ All Firebase listeners initialized\n");
    } catch (firebaseError) {
      console.warn("⚠️  Firebase sync warning (non-critical):", firebaseError.message);
      console.log("ℹ️  Continuing startup without Firebase sync...\n");
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 API running on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${NODE_ENV}`);
      console.log(`🌍 Client URL: ${process.env.CLIENT_URL || "http://localhost:3000"}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("📴 SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("📴 SIGINT received, shutting down gracefully...");
  process.exit(0);
});

start();
