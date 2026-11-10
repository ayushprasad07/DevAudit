"use client"

import AuditOrbitCarousel, { type AuditModule } from "@/components/ui/audit-orbit-carousel"

// Sample Unsplash photos (swap for your own later). Format params keep them light.
const u = (id: string, w = 700) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

const modules: AuditModule[] = [
  {
    title: "Dependency",
    subtitle: "Intelligence",
    label: "Dependency intelligence",
    image: u("1558494949-ef010cbdcc31"),
    alt: "Rows of servers in a data centre",
    audience: "For engineering",
    scope: "Manifests · lockfiles · transitive deps",
    description:
      "See exactly which version of every package is in use, what it pulls in transitively, and which dependencies deserve attention before the next release.",
    highlight: "Direct + transitive graph",
    checks: ["Resolved versions", "Transitive tree", "Outdated packages", "Inherited risk", "Duplicate versions"],
    accent: "#fb923c",
  },
  {
    title: "Secret",
    subtitle: "Exposure",
    label: "Secret exposure checks",
    image: u("1563986768609-322da13575f3"),
    alt: "Padlock over a digital security background",
    audience: "For security",
    scope: "Source files · configs · history patterns",
    description:
      "Surface API keys, tokens and credential-shaped strings before they quietly travel to production, with the file and line so the fix is immediate.",
    highlight: "File and line level",
    checks: ["API keys", "Access tokens", "Private key blocks", "Env file leaks", "High-entropy strings"],
    accent: "#f87171",
  },
  {
    title: "License",
    subtitle: "Clarity",
    label: "License clarity",
    image: u("1450101499163-c8848c66ca85"),
    alt: "Contract document with a pen",
    audience: "For legal and compliance",
    scope: "SPDX identifiers · obligations",
    description:
      "Map every package to its SPDX identifier and see the obligations that come with it, so conflicts and copyleft surprises are found before legal review turns into a fire drill.",
    highlight: "SPDX-mapped licenses",
    checks: ["SPDX identification", "Copyleft detection", "Missing licenses", "Conflicting terms", "Attribution duties"],
    accent: "#fbbf24",
  },
  {
    title: "Release-aware",
    subtitle: "Changes",
    label: "Release-aware changes",
    image: u("1555066931-4365d14bab8c"),
    alt: "Code on a laptop screen",
    audience: "For release owners",
    scope: "Diff since the last audit",
    description:
      "Compare against the previous audit and review only what changed, such as new packages, bumped versions and altered licenses, instead of re-reading the entire universe each release.",
    highlight: "Diff since last audit",
    checks: ["New dependencies", "Version bumps", "License changes", "Removed packages", "Resolved findings"],
    accent: "#a3e635",
  },
  {
    title: "Source-level",
    subtitle: "Context",
    label: "Source-level context",
    image: u("1461749280684-dccba630e2f6"),
    alt: "Source code on a dark monitor",
    audience: "For reviewers",
    scope: "Repository contents, not just manifests",
    description:
      "Findings are grounded in the repository itself, not only in manifest files, so reviewers can see where a package or pattern is actually used and judge how much it matters.",
    highlight: "Grounded in your repo",
    checks: ["Import usage", "Vendored code", "Embedded notices", "Config references", "Real file locations"],
    accent: "#38bdf8",
  },
  {
    title: "Evidence,",
    subtitle: "Not noise",
    label: "Evidence, not noise",
    image: u("1551288049-bebda4e38f71"),
    alt: "Analytics dashboard on a screen",
    audience: "For every team",
    scope: "Risk tiers · next steps",
    description:
      "Every finding carries a clear risk tier and a direct next step, so the right owner can make the next move without wading through a wall of alerts.",
    highlight: "Risk tiers + next steps",
    checks: ["Clear risk tiers", "Suggested fixes", "Owner-ready output", "Shareable evidence", "Low false-positive focus"],
    accent: "#c084fc",
  },
]

export default function SignalsShowcase() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })

  return (
    <section id="signal-explorer" aria-label="DevAudit signal explorer">
      <AuditOrbitCarousel
        modules={modules}
        backdrop={u("1518770660439-4636190af475", 1600)}
        fontFamily="var(--font-outfit)"
        onReport={() => scrollTo("report")}
        onRun={() => scrollTo("get-started")}
      />
    </section>
  )
}