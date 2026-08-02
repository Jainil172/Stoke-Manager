import LandingNavbar from "./sections/LandingNavbar.jsx";
import Hero from "./sections/Hero.jsx";
import Features from "./sections/Features.jsx";
import DashboardPreview from "./sections/DashboardPreview.jsx";
import Statistics from "./sections/Statistics.jsx";
import Pricing from "./sections/Pricing.jsx";
import Testimonials from "./sections/Testimonials.jsx";
import Faq from "./sections/Faq.jsx";
import Contact from "./sections/Contact.jsx";
import Footer from "./sections/Footer.jsx";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-white">
      <LandingNavbar />
      <main>
        <Hero />
        <Features />
        <DashboardPreview />
        <Statistics />
        <Pricing />
        <Testimonials />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
