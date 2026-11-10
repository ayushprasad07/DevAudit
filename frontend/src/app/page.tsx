import {NavbarDemo} from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import {Pipeline} from "@/components/Pipeline";
import Features from "@/components/Features";
import SignalsShowcase from "@/components/sections/signals-showcase"
import SampleReport from "@/components/SampleReport";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <NavbarDemo />
      <main>
        <Hero />
        <Stats />
        <Pipeline />
        {/* <Features /> */}
        <SignalsShowcase />
        <SampleReport />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
