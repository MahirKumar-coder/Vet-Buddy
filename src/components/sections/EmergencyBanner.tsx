"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Phone } from "lucide-react";
import { SECTION_IDS, SITE } from "@/lib/constants";

export function EmergencyBanner() {
  return (
    <section
      id={SECTION_IDS.emergency}
      className="relative py-8 md:py-10"
    >
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-emergency p-8 shadow-xl md:p-12"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/4 h-32 w-64 rounded-full bg-black/10 blur-3xl" />
          <div className="relative flex flex-col items-center text-center md:flex-row md:justify-between md:text-left">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-red-100">
                Critical care line
              </p>
              <h2 className="font-display mt-2 text-3xl font-bold text-white md:text-4xl">
                24×7 Pet Emergency Available
              </h2>
              <p className="mt-3 text-sm text-red-100 md:text-base">
                If your pet is in distress, call immediately. Our team triages
                emergencies and guides you on the next safest step.
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="mt-8 md:mt-0"
            >
              <Link
                href={`tel:${SITE.phoneTel}`}
                className="inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-red-700 shadow-lg transition hover:bg-red-50"
              >
                <Phone className="h-6 w-6" />
                <span>📞 {SITE.phone}</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
