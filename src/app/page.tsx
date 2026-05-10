import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { FloatingMobileButtons } from "@/components/layout/FloatingMobileButtons";
import { SectionCTA } from "@/components/ui/SectionCTA";
import { Hero } from "@/components/sections/Hero";
import { QuickActions } from "@/components/sections/QuickActions";
import { ConsultationSection } from "@/components/sections/ConsultationSection";
import { EmergencyBanner } from "@/components/sections/EmergencyBanner";
import { Services } from "@/components/sections/Services";
import { WhyChoose } from "@/components/sections/WhyChoose";
import { AboutSection } from "@/components/sections/AboutSection";
import { Doctors } from "@/components/sections/Doctors";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { AppointmentForm } from "@/components/sections/AppointmentForm";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-24 md:pb-0">
        <Hero />
        <QuickActions />
        <SectionCTA />

        <ConsultationSection />
        <EmergencyBanner />
        <SectionCTA />

        <Services />
        <WhyChoose />
        <SectionCTA />

        <AboutSection />
        <Doctors />
        <SectionCTA />

        <Testimonials />
        <FAQ />
        <SectionCTA />

        <AppointmentForm />
        <Contact />
        <SectionCTA variant="compact" />
      </main>
      <Footer />
      <MobileBottomNav />
      <FloatingMobileButtons />
    </>
  );
}
