"use client";

import Link from "next/link";
import { Home, Stethoscope, Phone, Calendar, MessageCircle } from "lucide-react";
import { SECTION_IDS, SITE } from "@/lib/constants";

const items = [
  { href: `#${SECTION_IDS.home}`, label: "Home", icon: Home },
  { href: `#${SECTION_IDS.services}`, label: "Care", icon: Stethoscope },
  { href: `tel:${SITE.phoneTel}`, label: "Call", icon: Phone, external: true },
  { href: SITE.whatsappUrl, label: "Chat", icon: MessageCircle, external: true },
  { href: `#${SECTION_IDS.appointment}`, label: "Book", icon: Calendar },
];

export function MobileBottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/50 bg-white/85 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_32px_rgba(15,23,42,0.08)] backdrop-blur-xl md:hidden"
      aria-label="Mobile quick navigation"
    >
      <ul className="mx-auto flex max-w-lg items-center justify-between">
        {items.map(({ href, label, icon: Icon, external }) => (
          <li key={label} className="flex-1">
            <Link
              href={href}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="flex flex-col items-center gap-0.5 rounded-xl py-1 text-[10px] font-semibold text-slate-600 transition active:scale-95"
            >
              <Icon className="h-5 w-5 text-sky-brand" strokeWidth={2} />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
