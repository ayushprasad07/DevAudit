import { ArrowDownRight, ArrowUpRight, CheckCircle2, GitBranch } from "lucide-react";
import BlackHoleHero from "@/components/ui/BlackHoleHero";
import HandwritingText from "@/components/ui/HandwritingText";

export default function Hero() {
  return <section className="hero" id="top" aria-label="DevAudit security intelligence">
    <BlackHoleHero className="hero-scene" wide={{ focus: [0.73, 0.5], distance: 21, diskOuter: 17, fov: 58, scrim: "left", scrimStrength: 0.96 }} narrow={{ focus: [0.5, 0.7], distance: 21, diskOuter: 17, fov: 62, scrim: "top", scrimStrength: 0.95 }}>
      <div className="shell hero-content"><div className="hero-copy">
        <p className="kicker"><span /> Secure development intelligence</p>
        <h1>See the risk<br />before it becomes</h1>
        <HandwritingText text="your release." />
        <p className="hero-description">DevAudit reads your repository like an attacker would—tracing dependencies, exposed secrets, vulnerable versions, and license obligations into one clear, actionable security picture.</p>
        <div className="hero-actions"><a className="button button-primary" href="#start"><GitBranch size={17} /> Audit a repository <ArrowUpRight size={16} /></a><a className="text-action" href="#report">Explore a sample report <ArrowDownRight size={17} /></a></div>
        <div className="hero-proof"><CheckCircle2 size={16} /> Read-only access · Your code stays yours · No credit card</div>
      </div></div>
    </BlackHoleHero>
  </section>;
}
