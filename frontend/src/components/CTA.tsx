import { ArrowUpRight, GitBranch, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { ShootingStars } from "./ui/shooting-stars";
import { StarsBackground } from "./ui/stars-background";

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-32 w-full" id="start">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[900px] w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-[140px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15] w-full"
        style={{
          backgroundImage:
            "linear-gradient(to right, #52525b12 1px, transparent 1px), linear-gradient(to bottom, #52525b12 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto max-full h-full">
        <div className="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-neutral-950/80 px-8 py-16 text-center backdrop-blur-sm sm:px-16">
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-orange-500/20 via-transparent to-transparent" />

          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/10 text-orange-400 shadow-[0_0_30px_-6px_rgba(249,115,22,0.7)]">
            <ShieldCheck size={30} />
          </div>

          <p className="relative mt-8 text-sm tracking-wide text-orange-400/80">
            Your next release has a story
          </p>
          <h2 className="relative mt-3 text-4xl font-medium leading-tight text-white sm:text-5xl">
            Make sure you
            <br />
            <span className="text-orange-400">know all of it.</span>
          </h2>
          <p className="relative mx-auto mt-5 max-w-md text-neutral-400">
            Connect a repository and turn hidden risk into a release-ready plan.
          </p>

          
           <Link href="/"
            className="group relative mt-9 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-medium text-black shadow-[0_0_30px_-8px_rgba(249,115,22,0.8)] transition-transform hover:scale-[1.03]"
          >
            <GitBranch size={17} />
            Start a free audit
            <ArrowUpRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>
        <ShootingStars/>
        <StarsBackground/>
      </div>
    </section>
  );
}