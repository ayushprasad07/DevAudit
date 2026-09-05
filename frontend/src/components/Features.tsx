import {
  BadgeCheck,
  Binary,
  FileKey2,
  GitPullRequestArrow,
  ScanSearch,
  Scale,
  type LucideIcon,
} from "lucide-react";
import ThreeDCard from "@/components/ui/three-d-card";

type Feature = { icon: LucideIcon; title: string; copy: string };
const features: Feature[] = [
  {
    icon: ScanSearch,
    title: "Dependency intelligence",
    copy: "Know which package version is in use, what it inherits, and whether it needs attention.",
  },
  {
    icon: FileKey2,
    title: "Secret exposure checks",
    copy: "Surface credentials and sensitive patterns before they quietly travel to production.",
  },
  {
    icon: Scale,
    title: "License clarity",
    copy: "Map packages to SPDX identifiers and spot obligations before legal review becomes a fire drill.",
  },
  {
    icon: GitPullRequestArrow,
    title: "Release-aware changes",
    copy: "Focus on what changed since the last audit instead of reviewing the entire universe again.",
  },
  {
    icon: Binary,
    title: "Source-level context",
    copy: "Go beyond manifest files with findings grounded in the repository itself.",
  },
  {
    icon: BadgeCheck,
    title: "Evidence, not noise",
    copy: "Clear risk tiers and direct next steps let the right owner make the next move.",
  },
];

export default function Features() {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-28" id="signals">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #52525b12 1px, transparent 1px), linear-gradient(to bottom, #52525b12 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-8 border-b border-white/10 pb-16 md:grid-cols-[1fr_1px_1fr]">
          <div>
            <p className="text-sm tracking-wide text-orange-400/80">The signals that matter</p>
            <h2 className="mt-3 text-4xl font-medium leading-tight text-white sm:text-5xl">
              Security context,
              <br />
              <span className="text-orange-400">not security theatre.</span>
            </h2>
          </div>
          <div className="hidden bg-white/10 md:block" />
          <p className="self-end text-neutral-400 md:pl-2">
            One audit pulls together the details your engineering, security, and
            legal teams need to make a confident release decision.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 overflow-hidden rounded-2xl border border-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, copy }) => (
            <ThreeDCard
              className="group relative flex flex-col gap-4 bg-neutral-950 p-8 transition-colors hover:bg-neutral-900"
              key={title}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 shadow-[0_0_20px_-6px_rgba(249,115,22,0.6)] transition-shadow group-hover:shadow-[0_0_28px_-4px_rgba(249,115,22,0.8)]">
                <Icon size={20} />
              </div>
              <h3 className="text-lg font-medium text-white">{title}</h3>
              <p className="text-[15px] leading-relaxed text-neutral-400">{copy}</p>
            </ThreeDCard>
          ))}
        </div>
      </div>
    </section>
  );
}