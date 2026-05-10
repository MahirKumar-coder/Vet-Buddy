"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  Zap,
  Wallet,
  Siren,
  Users,
  Home,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SECTION_IDS } from "@/lib/constants";

const reasons = [
  {
    title: "Trusted Doctors",
    desc: "Specialists and GPs with deep experience across surgery, medicine, and preventive care.",
    icon: BadgeCheck,
  },
  {
    title: "Fast Response",
    desc: "Same-day slots, quick triage, and streamlined digital follow-ups after every visit.",
    icon: Zap,
  },
  {
    title: "Affordable Care",
    desc: "Transparent pricing and care plans that respect your budget without cutting corners.",
    icon: Wallet,
  },
  {
    title: "Emergency Support",
    desc: "A dedicated emergency line with clear guidance when minutes truly matter.",
    icon: Siren,
  },
  {
    title: "Experienced Team",
    desc: "Nurses and technicians trained in low-stress handling for calmer pets.",
    icon: Users,
  },
  {
    title: "Home Service Available",
    desc: "Comfortable exams at home for seniors, anxious pets, or busy schedules.",
    icon: Home,
  },
];

export function WhyChoose() {
  return (
    <section id={SECTION_IDS.whyChoose} className="relative py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(56,189,248,0.08),transparent_50%)]" />
      <div className="relative mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-display text-3xl font-bold text-navy-900 md:text-4xl">
            Why families choose{" "}
            <span className="gradient-text">Vet Buddy</span>
          </h2>
          <p className="mt-3 text-slate-600">
            We blend medical depth with emotional intelligence — because healing
            happens when both pet and parent feel seen.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reasons.map(({ title, desc, icon: Icon }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <GlassCard className="h-full">
                <motion.div
                  whileHover={{ rotate: [0, -3, 3, 0] }}
                  transition={{ duration: 0.4 }}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900 text-white"
                >
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </motion.div>
                <h3 className="font-display mt-4 text-lg font-semibold text-navy-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {desc}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
