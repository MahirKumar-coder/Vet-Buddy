"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Video,
  Stethoscope,
  FileText,
  Siren,
  Sparkles,
  Check,
} from "lucide-react";
import { SECTION_IDS } from "@/lib/constants";
import { ImageWithSkeleton } from "@/components/ui/ImageWithSkeleton";
import { RazorpayPayment } from "@/components/shop/RazorpayPayment";
import {
  createAppointment,
  updateAppointment,
  createNotification,
} from "@/lib/firebase";
import { useToast } from "@/components/providers/ToastProvider";

const bullets = [
  { text: "Instant Vet Support", icon: Stethoscope },
  { text: "Prescription Guidance", icon: FileText },
  { text: "Emergency Advice", icon: Siren },
  { text: "Pet Health Tips", icon: Sparkles },
];

export function ConsultationSection() {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<"form" | "pay" | "success">("form");
  const [submitting, setSubmitting] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    petType: "Dog",
    serviceType: "Online consultation",
    appointmentDate: "",
    notes: "",
  });

  const { showToast } = useToast();

  const resetModal = () => {
    setShowModal(false);
    setStep("form");
    setSubmitting(false);
    setAppointmentId(null);
    setForm({
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      petType: "Dog",
      serviceType: "Online consultation",
      appointmentDate: "",
      notes: "",
    });
  };

  const handleCreateAndPay = async (e?: any) => {
    e?.preventDefault();
    if (submitting) return;
    if (!form.customerName || !form.customerPhone || !form.appointmentDate || !form.customerEmail) {
      showToast("❌ Please fill name, phone, email and preferred date");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.customerEmail)) {
      showToast("❌ Please enter a valid email address");
      return;
    }

    try {
      setSubmitting(true);

      const customerId = `customer_${Date.now()}`;
      const appointmentData = {
        customerId,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail,
        petName: "",
        petType: form.petType,
        serviceType: form.serviceType,
        appointmentDate: form.appointmentDate,
        appointmentTime: "",
        status: "pending",
        notes: form.notes,
        paymentMethod: "razorpay",
        paymentStatus: "pending",
        amount: 299,
      };

      const id = await createAppointment(appointmentData as any);
      setAppointmentId(id);
      setStep("pay");
      showToast("📝 Appointment saved. Proceed to payment...");
    } catch (err: any) {
      console.error(err);
      showToast("❌ Failed to create appointment. Try again.");
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (verifyData: { razorpayPaymentId: string; razorpayOrderId: string; orderId?: string }) => {
    try {
      if (!appointmentId) return;

      await updateAppointment(appointmentId, {
        paymentStatus: "paid",
        paymentDetails: {
          razorpayPaymentId: verifyData.razorpayPaymentId,
          razorpayOrderId: verifyData.razorpayOrderId,
          amount: 299,
        },
        paidAt: Date.now(),
      } as any);

      // Notify admin (userId = 'admin')
      await createNotification({
        userId: "admin",
        type: "appointment",
        title: "New paid consultation",
        message: `${form.customerName} paid for a consultation. Please schedule Google Meet.`,
        isRead: false,
        data: {
          appointmentId,
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          appointmentDate: form.appointmentDate,
          paymentId: verifyData.razorpayPaymentId,
        },
      } as any);

      setStep("success");
      showToast("✅ Payment successful. We notified the clinic.");
      setTimeout(() => resetModal(), 3000);
    } catch (err) {
      console.error(err);
      showToast("❌ Payment processed but failed to update appointment. Contact support.");
    }
  };

  const handlePaymentError = (err: string) => {
    showToast(`❌ Payment error: ${err}`);
    setSubmitting(false);
  };
  return (
    <section
      id={SECTION_IDS.consult}
      className="relative overflow-hidden py-16 md:py-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-50/50 via-white to-white" />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="relative mx-auto max-w-md">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] border border-white/70 shadow-glass-lg">
                <ImageWithSkeleton
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80"
                  alt="Veterinary doctor portrait"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 90vw, 400px"
                />
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="absolute -bottom-6 -right-2 w-[min(100%,280px)] rounded-2xl border border-white/60 bg-white/90 p-4 shadow-glass backdrop-blur-xl sm:right-4"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-brand">
                    <Video className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      Video consult
                    </p>
                    <p className="font-display text-sm font-bold text-navy-900">
                      Starting in 2 min
                    </p>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-sky-brand to-cyan-glow"
                    initial={{ width: "20%" }}
                    whileInView={{ width: "85%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-600">
              Online consultation
            </p>
            <h2 className="font-display mt-2 text-3xl font-bold text-navy-900 md:text-4xl">
              Talk to a vet from{" "}
              <span className="gradient-text">your living room</span>
            </h2>
            <p className="mt-4 text-slate-600">
              Crystal-clear video, structured follow-ups, and notes you can
              share with family — the same clinical rigor as an in-clinic visit.
            </p>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {bullets.map(({ text, icon: Icon }) => (
                <li
                  key={text}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 shadow-sm"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-brand">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-navy-900">
                    {text}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-end sm:flex-wrap lg:flex-nowrap">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-brand to-cyan-glow px-6 sm:px-8 py-3 sm:py-3.5 text-sm font-semibold text-white shadow-float transition hover:brightness-110 w-full sm:w-auto"
              >
                <Video className="h-4 w-4" />
                Consult Now
              </button>
              <div className="glass rounded-2xl border border-sky-100/80 px-4 sm:px-5 py-3 sm:py-4 shadow-glass w-full sm:w-auto">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Consultation fee
                </p>
                <p className="font-display mt-1 text-xl sm:text-2xl font-bold text-navy-900">
                  ₹299{" "}
                  <span className="text-sm sm:text-base font-medium text-slate-500">
                    / session
                  </span>
                </p>
                <ul className="mt-2 space-y-1 text-xs text-slate-600">
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    Includes digital prescription note
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    Follow-up chat for 24 hours
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => resetModal()}
          />

          <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            {step === "form" && (
              <form onSubmit={handleCreateAndPay} className="space-y-4">
                <h3 className="text-lg font-semibold">Pay & Book Consultation</h3>
                <p className="text-sm text-slate-600">Pay ₹299 to book a video consult. After payment, we'll notify the clinic to schedule a Google Meet.</p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={form.customerName}
                    onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                    required
                    placeholder="Your name"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                  <input
                    value={form.customerPhone}
                    onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
                    required
                    placeholder="Phone"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </div>

                <input
                  type="email"
                  value={form.customerEmail}
                  onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
                  required
                  placeholder="Your email (for video call link & receipt)"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    value={form.petType}
                    onChange={(e) => setForm((f) => ({ ...f, petType: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  >
                    <option>Dog</option>
                    <option>Cat</option>
                    <option>Bird</option>
                    <option>Rabbit</option>
                    <option>Other</option>
                  </select>
                  <input
                    type="date"
                    value={form.appointmentDate}
                    onChange={(e) => setForm((f) => ({ ...f, appointmentDate: e.target.value }))}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </div>

                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Message (symptoms, concerns)"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  rows={3}
                />

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm">Amount</p>
                    <p className="font-bold">₹299</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => resetModal()} className="rounded-xl border px-4 py-2">Cancel</button>
                    <button type="submit" className="rounded-xl bg-sky-brand px-4 py-2 text-white">Proceed to Pay</button>
                  </div>
                </div>
              </form>
            )}

            {step === "pay" && (
              <div>
                <RazorpayPayment
                  amount={299}
                  orderId={`CONSULT${Date.now()}`}
                  dbOrderId={appointmentId || undefined}
                  customerName={form.customerName}
                  customerEmail={form.customerEmail}
                  customerPhone={form.customerPhone}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
                <div className="mt-4 flex justify-end">
                  <button onClick={() => resetModal()} className="text-sm text-slate-500">Close</button>
                </div>
              </div>
            )}

            {step === "success" && (
              <div className="text-center">
                <h3 className="text-lg font-semibold">Payment Successful</h3>
                <p className="mt-2 text-sm text-slate-600">Thanks — we've notified the clinic. They'll reach out to schedule a Google Meet.</p>
                <div className="mt-4">
                  <button onClick={() => resetModal()} className="rounded-xl bg-sky-brand px-4 py-2 text-white">Done</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
