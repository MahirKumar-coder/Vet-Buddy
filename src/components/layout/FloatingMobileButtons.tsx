"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, Calendar, MessageCircle } from "lucide-react";
import { SECTION_IDS, SITE } from "@/lib/constants";

export function FloatingMobileButtons() {
  return (
    <div
      className="pointer-events-none fixed bottom-20 right-4 z-30 flex flex-col gap-3 md:hidden"
      aria-hidden={false}
    >
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="pointer-events-auto"
      >
        <Link
          href={SITE.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-green-600/30"
          aria-label="WhatsApp Vet Buddy"
        >
          <MessageCircle className="h-6 w-6" />
        </Link>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="pointer-events-auto"
      >
        <Link
          href={`tel:${SITE.phoneTel}`}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-brand to-cyan-glow text-white shadow-float"
          aria-label="Call clinic"
        >
          <Phone className="h-5 w-5" />
        </Link>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="pointer-events-auto"
      >
        <Link
          href={`#${SECTION_IDS.appointment}`}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/60 bg-white/95 text-navy-900 shadow-glass"
          aria-label="Book appointment"
        >
          <Calendar className="h-5 w-5 text-sky-brand" />
        </Link>
      </motion.div>
    </div>
  );
}
