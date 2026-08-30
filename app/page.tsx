import { About } from "@/components/landing/about";
import { FeaturesStats } from "@/components/landing/features-stats";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { Navbar } from "@/components/landing/navbar";
import { Pricing } from "@/components/landing/pricing";
import { Testimonials } from "@/components/landing/testimonials";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeaturesStats />
        <Testimonials />
        <Pricing />
        <About />
      </main>
      <Footer />
    </>
  );
}
