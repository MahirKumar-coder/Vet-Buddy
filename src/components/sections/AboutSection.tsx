"use client";

import { motion } from "framer-motion";
import { Heart, Target } from "lucide-react";
import { SECTION_IDS } from "@/lib/constants";

export function AboutSection() {
  return (
    <section id={SECTION_IDS.about} className="py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-600">
              About Vet Buddy
            </p>
            <h2 className="font-display mt-2 text-3xl font-bold text-navy-900 md:text-4xl">
              A clinic built around{" "}
              <span className="gradient-text">trust &amp; tenderness</span>
            </h2>
            <p className="mt-4 text-slate-600">
              Vet Buddy was founded to give Patna&apos;s pets a calmer, clearer
              healthcare experience — where advanced medicine meets gentle
              handling, and where every question from a worried parent is
              welcomed.
            </p>
            <p className="mt-3 text-slate-600">
              Our spaces are designed for low-stress visits, and our digital
              tools keep you connected to your pet&apos;s care journey between
              appointments.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-6 shadow-glass">
              <Heart className="h-8 w-8 text-sky-brand" strokeWidth={1.5} />
              <p className="font-display mt-4 text-lg font-semibold text-navy-900">
                Care first
              </p>
              <p className="mt-2 text-sm text-slate-600">
                We treat every pet like family — with patience, empathy, and
                evidence-based medicine.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-glass sm:mt-8">
              <Target className="h-8 w-8 text-cyan-glow" strokeWidth={1.5} />
              <p className="font-display mt-4 text-lg font-semibold text-navy-900">
                Clear outcomes
              </p>
              <p className="mt-2 text-sm text-slate-600">
                You leave with a plan you understand — medications, follow-ups,
                and warning signs to watch for.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
