import { ArrowUpRight, GitBranch, ShieldCheck } from "lucide-react";
export default function CTA() {
  return (
    <section className="cta-section" id="start">
      <div className="shell">
        <div className="cta-panel">
          <ShieldCheck className="cta-icon" size={34} />
          <p className="eyebrow">Your next release has a story</p>
          <h2>
            Make sure you
            <br />
            <em>know all of it.</em>
          </h2>
          <p>
            Connect a repository and turn hidden risk into a release-ready plan.
          </p>
          <a className="button button-primary" href="#top">
            <GitBranch size={17} /> Start a free audit{" "}
            <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
