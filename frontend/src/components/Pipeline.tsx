"use client";

import React from "react";
import { CircularCarousel } from "@/components/ui/circular-carousel";

const steps = [
  {
    id: "01",
    tag: "01",
    title: "Connect the context",
    description:
      "Choose a repository. DevAudit uses narrow, read-only GitHub access and builds a map of your source, manifests, and lock files.",
    image: "/step1.png",
  },
  {
    id: "02",
    tag: "02",
    title: "Trace the blast radius",
    description:
      "We follow each dependency and its version back through the repository, then match it with security, licensing, and maintenance signals.",
    image: "/step2.png",
  },
  {
    id: "03",
    tag: "03",
    title: "Ship with evidence",
    description:
      "Receive a prioritized report that tells your team exactly what changed, why it matters, and where to start.",
    image: "/step3.png",
  },
];

export function Pipeline() {
  return (
    <div className="relative overflow-hidden bg-black px-6 py-28" id="workflow">
      {/* ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[120px]" />

      <div className="relative mx-auto max-w-3xl text-center">
        <p className="text-sm tracking-wide text-orange-400/80">
          A calmer security workflow
        </p>
        <h2 className="mt-3 text-4xl font-medium text-white sm:text-5xl">
          From repository to
          <br />
          <span className="text-orange-400">release confidence.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-neutral-400">
          Security work should reduce uncertainty, not create another dashboard
          to babysit.
        </p>
      </div>

      <div className="relative mx-auto mt-16 flex max-w-5xl justify-center">
        <CircularCarousel items={steps} autoPlayInterval={5000} className="w-full" />
      </div>
    </div>
  );
}