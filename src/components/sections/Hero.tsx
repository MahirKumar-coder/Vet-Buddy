"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, Phone, Video, Shield } from "lucide-react";
import { SECTION_IDS, SITE } from "@/lib/constants";
import { ImageWithSkeleton } from "@/components/ui/ImageWithSkeleton";

export function Hero() {
  return (
    <section
      id={SECTION_IDS.home}
      className="relative min-h-[100dvh] overflow-hidden bg-hero-mesh pt-28 pb-16 md:pt-32 md:pb-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.12),transparent_50%)]" />
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-2 lg:gap-14">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-sky-700 shadow-sm backdrop-blur-md"
          >
            <Shield className="h-3.5 w-3.5" />
            {SITE.tagline}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-display mt-5 text-3xl font-bold leading-[1.1] tracking-tight text-navy-900 sm:text-5xl lg:text-[3.25rem]"
          >
            Advanced Veterinary Care{" "}
            <span className="gradient-text">For Your Pets</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg"
          >
            24×7 emergency support, online consultation, vaccinations,
            surgeries, home visits &amp; pet care — delivered with warmth and
            clinical excellence.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="mt-8 grid gap-3 grid-cols-1 sm:flex sm:flex-wrap"
          >
            <Link
              href={`#${SECTION_IDS.appointment}`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-brand to-cyan-glow px-6 py-3.5 text-sm font-semibold text-white shadow-float transition hover:brightness-110 active:scale-[0.98]"
            >
              <Calendar className="h-4 w-4" />
              Book Appointment
            </Link>
            <Link
              href={`#${SECTION_IDS.consult}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-6 py-3.5 text-sm font-semibold text-navy-900 shadow-sm backdrop-blur-md transition hover:border-sky-200 hover:bg-white"
            >
              <Video className="h-4 w-4 text-sky-brand" />
              Consult Now
            </Link>
            <Link
              href={`tel:${SITE.phoneTel}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50/90 px-6 py-3.5 text-sm font-semibold text-red-700 backdrop-blur-md transition hover:bg-red-100"
            >
              <Phone className="h-4 w-4" />
              Emergency Call
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative mx-auto w-full max-w-lg lg:max-w-none"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/60 shadow-glass-lg sm:aspect-[5/6] lg:aspect-square">
            <ImageWithSkeleton
              src="/hero-dog.jpeg"
              alt="Happy Golden Labrador smiling at home"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-900/40 via-transparent to-transparent" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            className="absolute -bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-xs"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/85 px-4 py-3 shadow-glass backdrop-blur-xl">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500 text-lg">
                📞
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                  24×7 Emergency Service
                </p>
                <Link
                  href={`tel:${SITE.phoneTel}`}
                  className="font-display text-sm font-bold text-navy-900"
                >
                  {SITE.phone}
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div
            aria-hidden
            className="absolute -right-4 top-10 hidden h-24 w-24 rounded-3xl border border-white/50 bg-white/40 shadow-glass backdrop-blur-md lg:block"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="absolute -left-6 bottom-24 hidden h-16 w-16 rounded-2xl bg-gradient-to-br from-sky-brand/30 to-cyan-glow/20 blur-xl lg:block"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 4 }}
          />
        </motion.div>
      </div>
    </section>
  );
}
