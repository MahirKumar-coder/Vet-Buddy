"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, Phone, Mail, AtSign } from "lucide-react";
import { SECTION_IDS, SITE } from "@/lib/constants";

export function Contact() {
  return (
    <section id={SECTION_IDS.contact} className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-display text-3xl font-bold text-navy-900 md:text-4xl">
            Visit &amp; <span className="gradient-text">reach us</span>
          </h2>
          <p className="mt-3 text-slate-600">
            We&apos;re here for tails, whiskers, and everything in between.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass space-y-5 rounded-3xl p-6 shadow-glass-lg md:p-8"
          >
            <div className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-sky-brand" />
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Address
                </p>
                <p className="mt-1 font-medium text-navy-900">
                  📍 {SITE.address}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-sky-brand" />
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Phone
                </p>
                <Link
                  href={`tel:${SITE.phoneTel}`}
                  className="mt-1 block font-medium text-navy-900 hover:text-sky-700"
                >
                  📞 {SITE.phone}
                </Link>
              </div>
            </div>
            <div className="flex gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-sky-brand" />
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Email
                </p>
                <Link
                  href={`mailto:${SITE.email}`}
                  className="mt-1 block font-medium text-navy-900 hover:text-sky-700"
                >
                  📧 {SITE.email}
                </Link>
              </div>
            </div>
            <div className="flex gap-3">
              <AtSign className="mt-0.5 h-5 w-5 shrink-0 text-sky-brand" />
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Instagram
                </p>
                <Link
                  href={SITE.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block font-medium text-navy-900 hover:text-sky-700"
                >
                  📸 {SITE.instagram}
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-3xl border border-slate-100 bg-slate-100 shadow-inner"
          >
            <div className="aspect-[4/3] w-full md:aspect-auto md:h-full md:min-h-[320px]">
              <iframe
                title="Vet Buddy location map"
                src="https://maps.google.com/maps?q=Jagat+Vihar+Patna+Bihar&t=&z=14&ie=UTF8&iwloc=&output=embed"
                className="h-full w-full border-0 grayscale-[20%] contrast-[1.05]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <p className="bg-white/90 px-4 py-2 text-center text-xs text-slate-500">
              Map preview — replace embed with your exact Google Maps link for
              production.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
