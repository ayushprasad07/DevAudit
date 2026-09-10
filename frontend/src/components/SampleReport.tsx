"use client";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CircleAlert,
  CircleCheck,
  CircleDashed,
} from "lucide-react";

const findings = [
  ["lodash", "4.17.15", "CVE-2021-23337", "Update required", "critical"],
  ["legacy-utils", "1.8.0", "GPL-3.0", "License review", "review"],
  ["pymongo", "4.6.2", "Apache-2.0", "Clear", "clear"],
] as const;

const stateStyles: Record<string, string> = {
  critical: "border-red-500/30 bg-red-500/10 text-red-400",
  review: "border-orange-500/30 bg-orange-500/10 text-orange-400",
  clear: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
};

export default function SampleReport() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section className="relative overflow-hidden bg-black px-6 py-28" id="report">
      <div className="pointer-events-none absolute right-0 top-1/3 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[120px]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
        <div>
          <p className="text-sm tracking-wide text-orange-400/80">
            A useful answer, not more data
          </p>
          <h2 className="mt-3 text-4xl font-medium leading-tight text-white sm:text-5xl">
            Know what to fix
            <br />
            <span className="text-orange-400">and why it matters.</span>
          </h2>
          <p className="mt-5 max-w-md text-neutral-400">
            Every finding includes the package, the rule behind it, the severity,
            and a crisp next action — so the conversation can move straight to
            resolution.
          </p>
          
           <a className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-orange-400 transition-colors hover:text-orange-300"
            href="#start"
          >
            See what an audit sees <ArrowUpRight size={17} />
          </a>
        </div>

        <div className="relative">
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-orange-500/30 via-orange-500/5 to-transparent opacity-70 blur-md" />
          <div className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-neutral-950 shadow-[0_0_50px_-15px_rgba(249,115,22,0.35)]">
            <div className="flex items-center gap-3 border-b border-white/10 bg-neutral-900/60 px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500/70" />
                <span className="h-3 w-3 rounded-full bg-orange-400/70" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
              </div>
              <span className="ml-1 font-mono text-xs text-neutral-500">
                devaudit / release-readiness
              </span>
              <CircleDashed
                size={14}
                className="ml-auto animate-spin text-neutral-600 [animation-duration:3s]"
              />
            </div>

            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-xs text-neutral-500">Production readiness</p>
                <p className="mt-0.5 text-lg font-medium text-white">
                  2 actions required
                </p>
              </div>
              <p className="text-xs text-neutral-500">Scan completed · just now</p>
            </div>

            <div className="divide-y divide-white/5 px-2 py-2">
              {findings.map(([name, version, signal, action, state], i) => (
                <div
                  key={name}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 transition-all duration-500 ease-out hover:bg-white/[0.03]"
                  style={{
                    transitionProperty: "opacity, transform",
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "translateY(0)" : "translateY(6px)",
                    transitionDelay: `${i * 120}ms`,
                  }}
                >
                  {state === "critical" ? (
                    <CircleAlert size={17} className="shrink-0 text-red-400" />
                  ) : state === "clear" ? (
                    <CircleCheck size={17} className="shrink-0 text-emerald-400" />
                  ) : (
                    <CircleDashed size={17} className="shrink-0 text-orange-400" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {name}{" "}
                      <span className="font-normal text-neutral-500">{version}</span>
                    </p>
                    <p className="text-xs text-neutral-500">{signal}</p>
                  </div>
                  <span
                    className={`shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${stateStyles[state]}`}
                  >
                    {action}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
              <span className="text-xs text-neutral-500">41 packages scanned</span>
              
               <a href="#start"
                className="flex items-center gap-1 text-xs font-medium text-orange-400 transition-colors hover:text-orange-300"
              >
                Open report <ArrowUpRight size={13} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}