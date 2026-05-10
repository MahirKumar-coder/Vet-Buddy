"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { SECTION_IDS } from "@/lib/constants";

const testimonials = [
  {
    name: "Ananya Mishra",
    pet: "Bruno · Indie",
    text: "Bruno had a late-night emergency — the team guided us on call and stabilized him within the hour. Forever grateful.",
  },
  {
    name: "Rahul Verma",
    pet: "Milo · Persian Cat",
    text: "The online consult felt as thorough as an in-person visit. Clear prescription and diet tips that actually worked.",
  },
  {
    name: "Neha Kapoor",
    pet: "Coco · Golden Retriever",
    text: "Home visit for Coco’s vaccination was stress-free. Gentle handling and transparent pricing — rare combo.",
  },
  {
    name: "Vikash Sinha",
    pet: "Oreo · Rabbit",
    text: "They took time to explain every step for Oreo’s surgery. Professional, kind, and always reachable.",
  },
];

export function Testimonials() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % testimonials.length),
      6000
    );
    return () => window.clearInterval(id);
  }, []);

  const prev = () =>
    setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  const next = () => setIndex((i) => (i + 1) % testimonials.length);

  const t = testimonials[index];

  return (
    <section id={SECTION_IDS.testimonials} className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-display text-3xl font-bold text-navy-900 md:text-4xl">
            Stories from <span className="gradient-text">pet parents</span>
          </h2>
          <p className="mt-3 text-slate-600">
            Real families. Real recoveries. The trust we never take for
            granted.
          </p>
        </motion.div>

        <div className="relative mx-auto mt-12 max-w-3xl">
          <div className="glass relative overflow-hidden rounded-3xl p-8 shadow-glass-lg md:p-12">
            <Quote className="absolute right-6 top-6 h-10 w-10 text-sky-brand/20" />
            <div className="flex justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={t.name}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35 }}
                className="mt-6"
              >
                <p className="text-lg leading-relaxed text-navy-900 md:text-xl">
                  “{t.text}”
                </p>
                <p className="mt-6 font-display font-semibold text-navy-900">
                  {t.name}
                </p>
                <p className="text-sm text-slate-500">{t.pet}</p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={prev}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-navy-900 transition hover:bg-sky-50"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === index
                        ? "w-8 bg-sky-brand"
                        : "w-2 bg-slate-200 hover:bg-slate-300"
                    }`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={next}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-navy-900 transition hover:bg-sky-50"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
