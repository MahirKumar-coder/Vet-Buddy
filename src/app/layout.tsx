import type { Metadata } from "next";
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { PageLoader } from "@/components/providers/PageLoader";
import { SITE } from "@/lib/constants";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} | ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description:
    "Vet Buddy offers 24×7 emergency support, online vet consultation, vaccinations, surgeries, home visits, and complete pet care in Patna.",
  keywords: [
    "veterinary clinic Patna",
    "pet hospital",
    "online vet consultation",
    "emergency vet",
    "pet vaccination",
    "Vet Buddy",
  ],
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description:
      "Advanced veterinary care with trusted doctors, emergency support, and online consultations.",
    type: "website",
    locale: "en_IN",
    siteName: SITE.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description:
      "Trusted veterinary care, emergency support, and online consultations for your pets.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${dmSans.variable} ${plusJakarta.variable} font-sans antialiased text-navy-900 bg-white`}
      >
        <ToastProvider>
          <PageLoader />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
