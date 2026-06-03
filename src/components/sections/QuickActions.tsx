"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Video,
  Siren,
  Syringe,
  Home,
  Pill,
  Apple,
  Plane,
  Hotel,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SECTION_IDS } from "@/lib/constants";
import { HomeVisitModal } from "@/components/ui/HomeVisitModal";

const actions = [
  {
    title: "Online Consultation",
    icon: Video,
    href: `#${SECTION_IDS.consult}`,
  },
  { title: "Emergency Surgery", icon: Siren, href: `#${SECTION_IDS.emergency}` },
  { title: "Vaccination", icon: Syringe, href: `#${SECTION_IDS.services}` },
  { title: "Pet Boarding", icon: Hotel, href: `#${SECTION_IDS.services}` },
  { title: "Home Visit", icon: Home, href: `#${SECTION_IDS.services}` },
  {
    title: "Medicine Delivery",
    icon: Pill,
    href: `#${SECTION_IDS.services}`,
  },
  { title: "Diet Plan", icon: Apple, href: `#${SECTION_IDS.services}` },
  {
    title: "Travel Certificate",
    icon: Plane,
    href: `#${SECTION_IDS.services}`,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export function QuickActions() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section
      id={SECTION_IDS.quickActions}
      className="relative py-16 md:py-20"
    >
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-display text-3xl font-bold text-navy-900 md:text-4xl">
            Care that fits your <span className="gradient-text">pet&apos;s day</span>
          </h2>
          <p className="mt-3 text-slate-600">
            Tap into the services pet parents use most — designed for speed on
            mobile and clarity on every screen.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 grid gap-3 grid-cols-1 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {actions.map(({ title, icon: Icon, href }) => {
            const isHomeVisit = title === "Home Visit";
            return (
              <motion.div key={title} variants={item}>
                <GlassCard className="flex h-full flex-col p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-brand/20 to-cyan-glow/10 text-sky-600">
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-display mt-4 text-lg font-semibold text-navy-900">
                    {title}
                  </h3>
                  <p className="mt-1 flex-1 text-sm text-slate-600">
                    Expert support with transparent guidance — book in seconds.
                  </p>
                  {isHomeVisit ? (
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="mt-4 inline-flex w-fit items-center rounded-full bg-navy-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-navy-800"
                    >
                      Get started
                    </button>
                  ) : (
                    <Link
                      href={href}
                      className="mt-4 inline-flex w-fit items-center rounded-full bg-navy-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-navy-800"
                    >
                      Get started
                    </Link>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Home Visit Details Modal */}
      <HomeVisitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
