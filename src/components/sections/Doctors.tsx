"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Phone, Calendar, Award } from "lucide-react";
import { SECTION_IDS, SITE } from "@/lib/constants";
import { ImageWithSkeleton } from "@/components/ui/ImageWithSkeleton";

const doctors = [
  {
    name: "Dr. Prince Kumar Jha",
    degree: "M.V.Sc (Surgery), PGDAW",
    image:
      "https://ui-avatars.com/api/?name=Prince+Kumar+Jha&background=0F172A&color=38BDF8&size=400&bold=true",
    experience: "2+ years",
  },
  {
    name: "Dr. Sonali Raj",
    degree: "PGDAW, B.V.Sc & A.H.",
    image:
      "https://ui-avatars.com/api/?name=Sonali+Raj&background=38BDF8&color=0F172A&size=400&bold=true",
    experience: "2+ years",
  },
];

export function Doctors() {
  return (
    <section id={SECTION_IDS.doctors} className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-display text-3xl font-bold text-navy-900 md:text-4xl">
            Meet our <span className="gradient-text">lead veterinarians</span>
          </h2>
          <p className="mt-3 text-slate-600">
            Experienced clinicians who combine surgical precision with gentle,
            reassuring care.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {doctors.map((doc, i) => (
            <motion.article
              key={doc.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass overflow-hidden rounded-3xl shadow-glass-lg"
            >
              <div className="grid gap-6 p-6 sm:grid-cols-[140px_1fr] sm:items-center">
                <div className="relative mx-auto aspect-square w-full max-w-[160px] overflow-hidden rounded-2xl border border-white/60 shadow-md sm:mx-0">
                  <ImageWithSkeleton
                    src={doc.image}
                    alt={doc.name}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-navy-900">
                    {doc.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-sky-700">
                    {doc.degree}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-navy-900/5 px-3 py-1 text-xs font-semibold text-navy-900">
                    <Award className="h-3.5 w-3.5 text-amber-500" />
                    {doc.experience} experience
                  </span>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={`tel:${SITE.phoneTel}`}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 transition hover:border-sky-200 hover:bg-sky-50 sm:flex-none"
                    >
                      <Phone className="h-4 w-4 text-sky-brand" />
                      Call
                    </Link>
                    <Link
                      href={`#${SECTION_IDS.appointment}`}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-brand to-cyan-glow px-4 py-2.5 text-sm font-semibold text-white shadow-float transition hover:brightness-110 sm:flex-none"
                    >
                      <Calendar className="h-4 w-4" />
                      Book
                    </Link>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
