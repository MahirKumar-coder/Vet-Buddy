"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiLoader } from "react-icons/fi";
import { formatINR } from "@/lib/shop/format";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type Props = {
  amount: number;
  orderId: string;
  dbOrderId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (verifyData: { razorpayPaymentId: string; razorpayOrderId: string; orderId?: string }) => void;
  onError: (error: string) => void;
};

export function RazorpayPayment({
  amount,
  orderId,
  dbOrderId,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onError,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleDemoPayment = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const verifyResponse = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpayOrderId: "demo_order_" + Date.now(),
          razorpayPaymentId: "demo_pay_" + Date.now(),
          razorpaySignature: "demo_bypass_signature",
          dbOrderId,
          orderId,
          isDemo: true,
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error("Demo payment verification failed");
      }

      const verifyData = await verifyResponse.json();
      if (!verifyData.success) {
        throw new Error(verifyData.message || "Demo verification failed");
      }

      setPaid(true);
      setTimeout(() =>
        onSuccess({
          razorpayPaymentId: "demo_pay_" + Date.now(),
          razorpayOrderId: "demo_order_" + Date.now(),
          orderId,
        }),
        800
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Demo payment failed";
      onError(message);
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // Step 1: Create Razorpay order on backend
      const createOrderResponse = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to paise
          orderId,
          dbOrderId,
          customerName,
          customerEmail,
          customerPhone,
        }),
      });

      if (!createOrderResponse.ok) {
        throw new Error("Failed to create payment order");
      }

      const { razorpayOrderId } = await createOrderResponse.json();

      // Step 2: Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(amount * 100),
        currency: "INR",
        name: "Vet Buddy",
        description: `Order #${orderId}`,
        order_id: razorpayOrderId,
        customer: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
            handler: async (response: any) => {
          try {
            // Step 3: Verify payment on backend
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                dbOrderId,
                orderId,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error("Payment verification failed");
            }

            const verifyData = await verifyResponse.json();
            if (!verifyData.success) {
              throw new Error(verifyData.message || "Payment verification failed");
            }

            // Payment successful! forward verification data
            setPaid(true);
            setTimeout(() =>
              onSuccess({
                razorpayPaymentId: verifyData.razorpayPaymentId || response.razorpay_payment_id,
                razorpayOrderId: verifyData.razorpayOrderId || razorpayOrderId,
                orderId: verifyData.orderId || orderId,
              }),
              800
            );
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Verification failed";
            onError(message);
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            onError("Payment cancelled");
          },
        },
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: {
          color: "#0ea5e9",
        },
      };

      if (!window.Razorpay) {
        throw new Error("Razorpay not loaded");
      }

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Payment initiation failed";
      onError(message);
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-shop-card p-6">
      <h3 className="font-display text-lg font-bold text-white">
        Secure Payment
      </h3>
      <p className="mt-1 text-sm text-slate-400">
        Powered by Razorpay - India's most trusted payment gateway
      </p>

      <AnimatePresence mode="wait">
        {!paid ? (
          <motion.div
            key="payment"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6"
          >
            <div className="rounded-xl border border-sky-brand/30 bg-sky-brand/5 p-4 mb-6">
              <p className="text-sm text-slate-300">Order Amount</p>
              <p className="text-3xl font-bold text-sky-brand mt-2">
                {formatINR(amount)}
              </p>
              <p className="text-xs text-slate-400 mt-2">Order ID: {orderId}</p>
            </div>

            <div className="space-y-3 mb-6 text-sm text-slate-400">
              <div className="flex items-start gap-3">
                <span className="text-sky-brand mt-1">✓</span>
                <span>Secure SSL encrypted payment</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sky-brand mt-1">✓</span>
                <span>
                  Multiple payment options (Cards, Wallets, UPI, NetBanking)
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sky-brand mt-1">✓</span>
                <span>Instant payment confirmation</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sky-brand mt-1">✓</span>
                <span>100% safe and secure with Razorpay</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePayment}
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-sky-brand to-cyan-glow py-3 font-semibold text-navy-900 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" />
                  Loading...
                </>
              ) : (
                "Pay Now with Razorpay"
              )}
            </button>

            <button
              type="button"
              onClick={handleDemoPayment}
              disabled={loading}
              className="mt-3 w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 py-2.5 text-sm font-semibold text-emerald-400 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" />
                  Processing Demo...
                </>
              ) : (
                "Simulate Demo Payment (Test Flow)"
              )}
            </button>

            <p className="mt-4 text-center text-xs text-slate-500">
              You will be redirected to Razorpay secure checkout
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center py-12"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400"
            >
              <FiCheck className="h-10 w-10" />
            </motion.span>
            <p className="mt-4 font-display text-xl font-bold text-white">
              Payment Successful!
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Thank you for shopping with Vet Buddy
            </p>
            <p className="mt-4 text-xs text-slate-500">
              Order ID: <span className="text-slate-300 font-mono">{orderId}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
