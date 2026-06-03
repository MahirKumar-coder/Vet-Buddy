"use client";

import { FormEvent, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Calendar, Send } from "lucide-react";
import { SECTION_IDS } from "@/lib/constants";
import { useToast } from "@/components/providers/ToastProvider";
import { createAppointment } from "@/lib/firebase";

const petTypes = ["Dog", "Cat", "Bird", "Rabbit", "Other"];
const serviceOptions = [
  "General check-up",
  "Vaccination",
  "Online consultation",
  "Emergency",
  "Surgery consult",
  "Home visit",
  "Grooming / boarding inquiry",
];

export function AppointmentForm() {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Extract form values with validation
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const phone = formData.get("phone") as string;
      const petType = formData.get("petType") as string;
      const service = formData.get("service") as string;
      const date = formData.get("date") as string;
      const message = formData.get("message") as string;

      // Validate required fields
      if (!name || !email || !phone || !petType || !service || !date) {
        showToast("❌ Please fill all required fields");
        setSubmitting(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast("❌ Please enter a valid email address");
        setSubmitting(false);
        return;
      }

      console.log("📝 Form data:", { name, email, phone, petType, service, date, message });

      // Generate a customer ID
      const customerId = `customer_${Date.now()}`;
      
      const appointmentData = {
        customerId,
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
        petType,
        petName: "",
        serviceType: service,
        appointmentDate: date,
        appointmentTime: "",
        status: "pending" as const,
        notes: message,
      };

      console.log("🚀 Sending to Firebase:", appointmentData);

      // Call Firebase service
      const appointmentId = await createAppointment(appointmentData);
      
      console.log("✅ Appointment created successfully:", appointmentId);

      // Reset form using ref
      if (formRef.current) {
        formRef.current.reset();
      }

      setSubmitting(false);
      showToast(`✅ Appointment saved! ID: ${appointmentId}`);
      
    } catch (error: any) {
      console.error("❌ Full error object:", error);
      console.error("❌ Error message:", error?.message);
      console.error("❌ Error code:", error?.code);
      console.error("❌ Error details:", JSON.stringify(error, null, 2));
      
      setSubmitting(false);
      showToast("❌ Failed to save appointment. Check console for details.");
    }
  }

  return (
    <section
      id={SECTION_IDS.appointment}
      className="relative py-16 md:py-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-sky-50/30 to-white" />
      <div className="relative mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-display text-3xl font-bold text-navy-900 md:text-4xl">
            Book an <span className="gradient-text">appointment</span>
          </h2>
          <p className="mt-3 text-slate-600">
            Share a few details — our care team will confirm your slot and prep
            your visit.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mt-10 max-w-2xl"
        >
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="glass space-y-4 rounded-3xl p-5 shadow-glass-lg sm:p-6 md:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-navy-900">
                Your name
                <input
                  required
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Full name"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none ring-sky-brand/30 transition focus:ring-2"
                />
              </label>
              <label className="block text-sm font-medium text-navy-900">
                Email
                <input
                  required
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none ring-sky-brand/30 transition focus:ring-2"
                />
              </label>
            </div>
            <label className="block text-sm font-medium text-navy-900">
              Phone
              <input
                required
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="10-digit mobile"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none ring-sky-brand/30 transition focus:ring-2"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-navy-900">
                Pet type
                <select
                  required
                  name="petType"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none ring-sky-brand/30 transition focus:ring-2"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select pet type
                  </option>
                  {petTypes.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-navy-900">
                Service
                <select
                  required
                  name="service"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none ring-sky-brand/30 transition focus:ring-2"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select service
                  </option>
                  {serviceOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block text-sm font-medium text-navy-900">
              Preferred date
              <input
                required
                name="date"
                type="date"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none ring-sky-brand/30 transition focus:ring-2"
              />
            </label>
            <label className="block text-sm font-medium text-navy-900">
              Message
              <textarea
                name="message"
                rows={4}
                placeholder="Symptoms, concerns, or questions..."
                className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none ring-sky-brand/30 transition focus:ring-2"
              />
            </label>
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: submitting ? 1 : 1.02 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-brand to-cyan-glow py-3.5 text-sm font-semibold text-white shadow-float transition disabled:opacity-70"
            >
              {submitting ? (
                "Saving..."
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  Submit request
                  <Send className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}