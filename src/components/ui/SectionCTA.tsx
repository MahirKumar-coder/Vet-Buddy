"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Phone, Calendar, Video } from "lucide-react";
import { SECTION_IDS, SITE } from "@/lib/constants";

type SectionCTAProps = {
  variant?: "default" | "compact";
};

export function SectionCTA({ variant = "default" }: SectionCTAProps) {
  const isCompact = variant === "compact";

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className={`relative mx-auto w-full max-w-6xl px-4 ${
        isCompact ? "py-8" : "py-12"
      }`}
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-900 via-slate-800 to-navy-900 p-5 shadow-glass-lg sm:p-8 md:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-brand/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-cyan-glow/15 blur-3xl" />
        <div className="relative flex flex-col gap-4 md:gap-6 items-center text-center md:flex-row md:justify-between md:text-left">
          <div className="max-w-xl">
            <p className="font-display text-base sm:text-lg font-semibold text-white md:text-xl">
              Need help right now?
            </p>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 md:text-base">
              Book a visit, start a video consult, or reach our emergency line —
              we are here for your pet.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
            <Link
              href={`tel:${SITE.phoneTel}`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-xs sm:text-sm font-semibold text-navy-900 shadow-float transition hover:scale-[1.02] active:scale-[0.98] order-2 sm:order-1"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Call {SITE.phone}</span>
              <span className="sm:hidden">Call</span>
            </Link>
            <Link
              href={`#${SECTION_IDS.appointment}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-3 text-xs sm:text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20 order-1 sm:order-2"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Book appointment</span>
              <span className="sm:hidden">Book</span>
            </Link>
            <Link
              href={`#${SECTION_IDS.consult}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-3 text-xs sm:text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20 order-3"
            >
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">Consult online</span>
              <span className="sm:hidden">Consult</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
