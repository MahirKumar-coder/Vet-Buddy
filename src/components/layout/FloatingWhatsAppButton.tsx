"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { SITE } from "@/lib/constants";

export function FloatingWhatsAppButton() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
      whileHover={{ scale: 1.1 }}
      className="pointer-events-auto fixed bottom-6 right-6 z-40"
    >
      <Link
        href={SITE.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-green-600/40 transition-shadow duration-300 hover:shadow-xl hover:shadow-green-600/50"
        aria-label="Chat with us on WhatsApp"
        title="Chat with us on WhatsApp"
      >
        <MessageCircle className="h-7 w-7" />
      </Link>
    </motion.div>
  );
}
