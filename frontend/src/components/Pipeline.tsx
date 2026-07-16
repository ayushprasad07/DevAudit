import React from "react";

export default function Pipeline() {
  return (
    <section className="wrap" id="how">
      <div className="section-head">
        <span className="section-tag">Pipeline</span>
        <h2>Three steps, one continuous stream</h2>
        <p>
          No background workers, no waiting on a queue. The scan runs and reports
          back live.
        </p>
      </div>
      <div className="steps">
        <div className="step">
          <span className="num">01 / connect</span>
          <h3>Sign in with GitHub</h3>
          <p>
            OAuth 2.0 requests read-only access to the repositories you choose
            to audit. Revoke it anytime from your GitHub settings.
          </p>
          <span className="tag">github oauth</span>
        </div>
        <div className="step">
          <span className="num">02 / scan</span>
          <h3>Source flows into the pipeline</h3>
          <p>
            Files are read directly — not just manifests — and cross-referenced
            against SPDX license definitions through a RAG pipeline, streamed
            over SSE as each result lands.
          </p>
          <span className="tag">rag + sse</span>
        </div>
        <div className="step">
          <span className="num">03 / report</span>
          <h3>Get a risk-scored breakdown</h3>
          <p>
            Every dependency lands in a tier — permissive, weak-copyleft,
            copyleft, or unknown — with the exact file and line that triggered
            the flag.
          </p>
          <span className="tag">exportable</span>
        </div>
      </div>
    </section>
  );
}
