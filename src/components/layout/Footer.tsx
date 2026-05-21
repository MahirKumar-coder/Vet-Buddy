import Link from "next/link";
import { PawPrint, Phone, Mail, MapPin, AtSign } from "lucide-react";
import { SECTION_IDS, SITE } from "@/lib/constants";

const quickLinks = [
  { label: "Home", href: `#${SECTION_IDS.home}` },
  { label: "Services", href: `#${SECTION_IDS.services}` },
  { label: "Consultation", href: `#${SECTION_IDS.consult}` },
  { label: "Book appointment", href: `#${SECTION_IDS.appointment}` },
];

const serviceLinks = [
  { label: "Pet hospital", href: `#${SECTION_IDS.services}` },
  { label: "Emergency", href: `#${SECTION_IDS.emergency}` },
  { label: "Vaccination", href: `#${SECTION_IDS.services}` },
  { label: "Home visits", href: `#${SECTION_IDS.services}` },
];

export function Footer() {
  return (
    <footer className="relative border-t border-slate-200/80 bg-navy-900 text-slate-300">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-brand/50 to-transparent" />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12 md:py-14">
        <div className="grid gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link
              href={`#${SECTION_IDS.home}`}
              className="flex items-center gap-2 font-display text-lg font-bold text-white"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-brand to-cyan-glow text-white">
                <PawPrint className="h-5 w-5" strokeWidth={2} />
              </span>
              {SITE.name}
            </Link>
            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-400">
              {SITE.tagline}. Compassionate care for every tail, whisker, and
              paw — in clinic and at home.
            </p>
          </div>

          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-wide text-white">
              Quick links
            </p>
            <ul className="mt-4 space-y-2 text-xs sm:text-sm">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="hover:text-sky-brand transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-wide text-white">
              Services
            </p>
            <ul className="mt-4 space-y-2 text-xs sm:text-sm">
              {serviceLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="hover:text-sky-brand transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-wide text-white">
              Contact
            </p>
            <ul className="mt-4 space-y-3 text-xs sm:text-sm">
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-brand" />
                <span>{SITE.address}</span>
              </li>
              <li className="flex gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-sky-brand" />
                <Link
                  href={`tel:${SITE.phoneTel}`}
                  className="hover:text-sky-brand transition-colors"
                >
                  {SITE.phone}
                </Link>
              </li>
              <li className="flex gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-sky-brand" />
                <Link
                  href={`mailto:${SITE.email}`}
                  className="hover:text-sky-brand transition-colors"
                >
                  {SITE.email}
                </Link>
              </li>
              <li className="flex gap-2">
                <AtSign className="mt-0.5 h-4 w-4 shrink-0 text-sky-brand" />
                <Link
                  href={SITE.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sky-brand transition-colors"
                >
                  {SITE.instagram}
                </Link>
              </li>
            </ul>
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-950/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-200">
                Emergency support
              </p>
              <Link
                href={`tel:${SITE.phoneTel}`}
                className="mt-1 inline-flex text-lg font-bold text-white hover:text-red-100"
              >
                📞 {SITE.phone}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-slate-500 md:flex-row">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p className="text-center md:text-right">
            Made with care for pets and their families in Patna.
          </p>
        </div>
      </div>
    </footer>
  );
}
