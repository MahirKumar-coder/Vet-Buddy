"use client";

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

const bullets = [
  { text: "Instant Vet Support", icon: Stethoscope },
  { text: "Prescription Guidance", icon: FileText },
  { text: "Emergency Advice", icon: Siren },
  { text: "Pet Health Tips", icon: Sparkles },
];

export function ConsultationSection() {
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
              <Link
                href={`#${SECTION_IDS.appointment}`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-brand to-cyan-glow px-6 sm:px-8 py-3 sm:py-3.5 text-sm font-semibold text-white shadow-float transition hover:brightness-110 w-full sm:w-auto"
              >
                <Video className="h-4 w-4" />
                Consult Now
              </Link>
              <div className="glass rounded-2xl border border-sky-100/80 px-4 sm:px-5 py-3 sm:py-4 shadow-glass w-full sm:w-auto">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Consultation fee
                </p>
                <p className="font-display mt-1 text-xl sm:text-2xl font-bold text-navy-900">
                  ₹499{" "}
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
    </section>
  );
}
