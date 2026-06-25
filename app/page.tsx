import Navbar from "./_components/landing/Navbar";
import Hero from "./_components/landing/Hero";
import Features from "./_components/landing/Features";
import HowItWorks from "./_components/landing/HowItWorks";
import DanceStyles from "./_components/landing/DanceStyles";
import AchievementShowcase from "./_components/landing/AchievementShowcase";
import Testimonials from "./_components/landing/Testimonials";
import CtaSection from "./_components/landing/CtaSection";
import Footer from "./_components/landing/Footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <DanceStyles />
        <AchievementShowcase />
        <Testimonials />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
