"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SECTION_IDS } from "@/lib/constants";

const faqs = [
  {
    q: "How do I book an appointment?",
    a: "Use the booking form on this page, call our clinic line, or WhatsApp us with your pet’s name and preferred time. We’ll confirm within minutes during working hours.",
  },
  {
    q: "What are your emergency timings?",
    a: "Our emergency helpline is available 24×7 for triage and guidance. In-person emergency capacity may vary — call ahead so we can prepare for your arrival.",
  },
  {
    q: "Is online consultation available?",
    a: "Yes. You can video consult with our veterinarians for non-emergency concerns, follow-ups, prescription guidance, and diet planning.",
  },
  {
    q: "Do you offer home visits?",
    a: "Home visits are available in select areas around Patna for vaccinations, senior pet checks, and cases where travel is stressful for your pet.",
  },
  {
    q: "How much do vaccinations cost?",
    a: "Pricing depends on vaccine type, pet size, and schedule. We share a clear estimate before administration — no surprise add-ons.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id={SECTION_IDS.faq} className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-display text-3xl font-bold text-navy-900 md:text-4xl">
            Questions, <span className="gradient-text">answered</span>
          </h2>
          <p className="mt-3 text-slate-600">
            Straightforward answers so you can make confident decisions for your
            pet.
          </p>
        </motion.div>

        <ul className="mt-10 space-y-3">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <motion.li
                key={item.q}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="overflow-hidden rounded-2xl border border-slate-100 bg-white/90 shadow-sm backdrop-blur-md"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-sm font-semibold text-navy-900 md:text-base">
                    {item.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    className="shrink-0 text-slate-400"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28 }}
                    >
                      <p className="border-t border-slate-100 px-5 pb-4 pt-3 text-sm leading-relaxed text-slate-600">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
