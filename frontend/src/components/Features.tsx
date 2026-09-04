import { BadgeCheck, Binary, FileKey2, GitPullRequestArrow, ScanSearch, Scale, type LucideIcon } from "lucide-react";
import ThreeDCard from "@/components/ui/three-d-card";

type Feature = { icon: LucideIcon; title: string; copy: string };
const features: Feature[] = [
  { icon: ScanSearch, title: "Dependency intelligence", copy: "Know which package version is in use, what it inherits, and whether it needs attention." },
  { icon: FileKey2, title: "Secret exposure checks", copy: "Surface credentials and sensitive patterns before they quietly travel to production." },
  { icon: Scale, title: "License clarity", copy: "Map packages to SPDX identifiers and spot obligations before legal review becomes a fire drill." },
  { icon: GitPullRequestArrow, title: "Release-aware changes", copy: "Focus on what changed since the last audit instead of reviewing the entire universe again." },
  { icon: Binary, title: "Source-level context", copy: "Go beyond manifest files with findings grounded in the repository itself." },
  { icon: BadgeCheck, title: "Evidence, not noise", copy: "Clear risk tiers and direct next steps let the right owner make the next move." },
];

export default function Features() { return <section className="section section-muted" id="signals"><div className="shell"><div className="split-heading"><div><p className="eyebrow">The signals that matter</p><h2>Security context,<br /><em>not security theatre.</em></h2></div><p>One audit pulls together the details your engineering, security, and legal teams need to make a confident release decision.</p></div><div className="feature-grid">{features.map(({ icon: Icon, title, copy }) => <ThreeDCard className="feature-card" key={title}><Icon size={21} /><h3>{title}</h3><p>{copy}</p></ThreeDCard>)}</div></div></section>; }
