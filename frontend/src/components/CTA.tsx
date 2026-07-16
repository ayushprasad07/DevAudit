import React from "react";

export default function CTA() {
  return (
    <section className="wrap" style={{ overflow: "hidden" }}>
      {/* Dynamic background lighting for CTA */}
      <div
        className="aurora-glow"
        style={{
          top: "-20%",
          right: "-10%",
          width: "480px",
          height: "480px",
          animationDelay: "-7s",
        }}
      ></div>

      <div className="cta-band glass-card">
        <div>
          <h3>Run your first audit before your next release.</h3>
          <p className="note">Free while in beta · no credit card</p>
        </div>
        <a href="#" className="btn-primary">
          Connect a repository →
        </a>
      </div>
    </section>
  );
}
