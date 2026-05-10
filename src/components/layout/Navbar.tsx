"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, PawPrint } from "lucide-react";
import { SECTION_IDS, SITE } from "@/lib/constants";

const navLinks = [
  { label: "Home", href: `#${SECTION_IDS.home}` },
  { label: "Services", href: `#${SECTION_IDS.services}` },
  { label: "Consult a Vet", href: `#${SECTION_IDS.consult}` },
  { label: "Emergency", href: `#${SECTION_IDS.emergency}` },
  { label: "About", href: `#${SECTION_IDS.about}` },
  { label: "Contact", href: `#${SECTION_IDS.contact}` },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full">
      <div className="mx-auto max-w-6xl px-4 pt-3 md:pt-4">
        <nav
          className="flex items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/75 px-4 py-3 shadow-glass backdrop-blur-xl md:px-6"
          aria-label="Main"
        >
          <Link
            href={`#${SECTION_IDS.home}`}
            className="flex items-center gap-2 font-display text-lg font-bold text-navy-900"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-brand to-cyan-glow text-white shadow-float">
              <PawPrint className="h-5 w-5" strokeWidth={2} />
            </span>
            {SITE.name}
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {navLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-sky-50 hover:text-navy-900"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden lg:block">
            <Link
              href={`#${SECTION_IDS.appointment}`}
              className="inline-flex items-center rounded-full bg-gradient-to-r from-sky-brand to-cyan-glow px-5 py-2.5 text-sm font-semibold text-white shadow-float transition hover:brightness-110"
            >
              Book Appointment
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-navy-900 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle menu</span>
          </button>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mt-2 overflow-hidden rounded-2xl border border-white/60 bg-white/95 p-4 shadow-glass-lg backdrop-blur-xl lg:hidden"
            >
              <ul className="flex flex-col gap-1">
                {navLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-3 py-3 text-sm font-medium text-navy-900 hover:bg-sky-50"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li className="pt-2">
                  <Link
                    href={`#${SECTION_IDS.appointment}`}
                    onClick={() => setOpen(false)}
                    className="block rounded-full bg-gradient-to-r from-sky-brand to-cyan-glow py-3 text-center text-sm font-semibold text-white shadow-float"
                  >
                    Book Appointment
                  </Link>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
