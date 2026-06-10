import { Router } from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentStatus,
} from "../controllers/paymentController.js";

const router = Router();

// Create Razorpay order
router.post("/create", createRazorpayOrder);

// Verify Razorpay payment
router.post("/verify", verifyRazorpayPayment);

// Check payment status
router.get("/status/:orderId", getPaymentStatus);

export default router;
