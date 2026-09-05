"use client";
import React from "react";
import { TracingBeam } from "./ui/tracing-beam";

const dummyContent = [
  {
    title: "Connect the context",
    description:
      "Choose a repository. DevAudit uses narrow, read-only GitHub access and builds a map of your source, manifests, and lock files.",
    badge: "01",
    image: "/step1.png",
  },
  {
    title: "Trace the blast radius",
    description:
      "We follow each dependency and its version back through the repository, then match it with security, licensing, and maintenance signals.",
    badge: "02",
    image: "/step2.png",
  },
  {
    title: "Ship with evidence",
    description:
      "Receive a prioritized report that tells your team exactly what changed, why it matters, and where to start.",
    badge: "03",
    image: "/step3.png",
  },
];

export function Pipeline() {
  return (
    <div className="relative overflow-hidden bg-black px-6 py-28" id="workflow">
      {/* ambient glow, matches the reference art */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[120px]" />

      <div className="relative mx-auto max-w-3xl text-center">
        <p className="text-sm tracking-wide text-orange-400/80">A calmer security workflow</p>
        <h2 className="mt-3 text-4xl font-medium text-white sm:text-5xl">
          From repository to
          <br />
          <span className="text-orange-400">release confidence.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-neutral-400">
          Security work should reduce uncertainty, not create another dashboard to babysit.
        </p>
      </div>

      <TracingBeam className="px-6">
        <div className="relative mx-auto mt-20 max-w-4xl">
          {dummyContent.map((item, index) => {
            const reversed = index % 2 === 1;
            return (
              <div
                key={item.badge}
                className={`mb-28 flex flex-col items-center gap-10 last:mb-0 md:flex-row ${
                  reversed ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* image side */}
                <div className="relative w-full md:w-1/2">
                  <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-orange-500/40 via-orange-500/5 to-transparent opacity-60 blur-md" />
                  <div className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-neutral-950 shadow-[0_0_40px_-15px_rgba(249,115,22,0.4)]">
                    <img
                      src={item.image}
                      alt={item.title}
                      width={1000}
                      height={1000}
                      className="aspect-[3/2] w-full object-cover"
                    />
                  </div>
                </div>

                {/* text side */}
                <div className="w-full md:w-1/2">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-orange-500/40 bg-orange-500/10 text-sm font-medium text-orange-400 shadow-[0_0_20px_-4px_rgba(249,115,22,0.6)]">
                      {item.badge}
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-orange-500/40 to-transparent" />
                  </div>
                  <h3 className="mt-6 text-2xl font-medium text-white">{item.title}</h3>
                  <p className="mt-3 leading-relaxed text-neutral-400">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </TracingBeam>
    </div>
  );
}