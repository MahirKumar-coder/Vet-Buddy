"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Home, Sun, Moon, Check, Phone } from "lucide-react";
import { SITE } from "@/lib/constants";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function HomeVisitModal({ isOpen, onClose }: Props) {
  
  const handleBookNow = () => {
    onClose();
    
    // Smooth scroll to the appointment booking form
    setTimeout(() => {
      const select = document.querySelector('select[name="service"]') as HTMLSelectElement;
      if (select) {
        select.value = "Home visit";
        // Dispatch event so React context captures the change
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
      
      const appointmentSection = document.getElementById("appointment");
      if (appointmentSection) {
        appointmentSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/60 bg-white/95 p-6 shadow-glass-lg backdrop-blur-xl md:p-8"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:text-navy-900 shadow-sm transition"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-brand shadow-sm">
                <Home className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-navy-900 md:text-xl">
                  Veterinary Home Visits
                </h3>
                <p className="text-xs text-slate-500">Premium pet care delivered to your doorstep</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Skip the stress of clinic travel. Our certified veterinary doctors will visit your home in Patna to provide comprehensive medical checks, vaccinations, and supportive care.
            </p>

            {/* Pricing Tiers */}
            <h4 className="font-display mt-6 text-sm font-semibold uppercase tracking-wider text-slate-400">
              Pricing & Shifts
            </h4>
            
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {/* Day Shift */}
              <div className="rounded-2xl border border-sky-100 bg-sky-50/30 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sky-600">
                  <Sun className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wide">Day Shift</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">9:00 AM - 9:00 PM</p>
                <p className="font-display mt-2 text-2xl font-bold text-navy-900">
                  ₹1,000 <span className="text-xs font-medium text-slate-500">/ visit</span>
                </p>
              </div>

              {/* Night Shift */}
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/20 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-indigo-500">
                  <Moon className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wide">Night Shift</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">9:00 PM - 9:00 AM</p>
                <p className="font-display mt-2 text-2xl font-bold text-navy-900">
                  ₹1,500 <span className="text-xs font-medium text-slate-500">/ visit</span>
                </p>
              </div>
            </div>

            {/* Bullet Points */}
            <ul className="mt-6 space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                Includes complete clinical body checkup and diagnosis note.
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                Vaccinations or medicines administered will be charged extra at MRP.
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                Available 24x7 all across Patna limits.
              </li>
            </ul>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                onClick={handleBookNow}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-gradient-to-r from-sky-brand to-cyan-glow py-3.5 text-sm font-semibold text-white shadow-float transition hover:brightness-110"
              >
                Book Home Visit Now
              </button>
              <a
                href={`tel:${SITE.phoneTel}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-navy-900 transition hover:bg-slate-50"
              >
                <Phone className="h-4 w-4" />
                Call Clinic
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
