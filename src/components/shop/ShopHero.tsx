"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function ShopHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-sky-50 via-white to-white px-6 py-12 md:px-10 md:py-16">
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-brand/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 left-10 h-48 w-48 rounded-full bg-cyan-glow/10 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-2xl"
      >
        <span className="inline-block rounded-full border border-sky-brand/30 bg-sky-brand/10 px-3 py-1 text-xs font-semibold text-sky-brand">
          Vet Buddy Pet Store
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold text-navy-900 md:text-5xl">
          Premium pet care,{" "}
          <span className="gradient-text">delivered fast</span>
        </h1>
        <p className="mt-4 text-slate-600 md:text-lg">
          Veterinary medicines, health supplements & wellness care — trusted by pet parents across Patna.
          Same care as our clinic, now at your doorstep.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="#products"
            className="rounded-full bg-gradient-to-r from-sky-brand to-cyan-glow px-6 py-3 text-sm font-semibold text-white shadow-float"
          >
            Shop Now
          </a>
          <Link
            href="/#appointment"
            className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-navy-900 transition hover:border-sky-brand"
          >
            Book Vet Visit
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
