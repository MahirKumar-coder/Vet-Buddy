"use client";

import { motion } from "framer-motion";
import {
  Building2,
  Siren,
  Droplets,
  Syringe,
  Home,
  Hotel,
  Truck,
  Video,
  ClipboardList,
  Apple,
  Plane,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SECTION_IDS } from "@/lib/constants";

const services = [
  { title: "Pet Hospital", icon: Building2 },
  { title: "Emergency Surgeries", icon: Siren },
  { title: "Blood Tests", icon: Droplets },
  { title: "Vaccination", icon: Syringe },
  { title: "Home Visits", icon: Home },
  { title: "Pet Boarding", icon: Hotel },
  { title: "Food & Medicine Delivery", icon: Truck },
  { title: "Online Consultation", icon: Video },
  { title: "Prescription", icon: ClipboardList },
  { title: "Diet Planning", icon: Apple },
  { title: "Travel Certificate", icon: Plane },
];

export function Services() {
  return (
    <section id={SECTION_IDS.services} className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-display text-3xl font-bold text-navy-900 md:text-4xl">
            Full-spectrum <span className="gradient-text">clinical services</span>
          </h2>
          <p className="mt-3 text-slate-600">
            From preventive wellness to advanced procedures — one trusted team
            for every stage of your pet&apos;s life.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ title, icon: Icon }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: (i % 6) * 0.05 }}
            >
              <GlassCard className="h-full p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-brand/15 to-cyan-glow/10 text-sky-600">
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-navy-900">
                      {title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Protocol-driven care with gentle handling and clear pet
                      parent communication.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
