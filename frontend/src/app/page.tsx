import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Pipeline from "@/components/Pipeline";
import Features from "@/components/Features";
import SampleReport from "@/components/SampleReport";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Pipeline />
        <Features />
        <SampleReport />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
