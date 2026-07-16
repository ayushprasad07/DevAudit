import React from "react";
import Terminal from "./Terminal";
import NetworkGraph from "./NetworkGraph";

export default function Hero() {
  return (
    <section className="hero wrap">
      <div>
        <span className="eyebrow">
          <span
            className="dot"
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "var(--accent)",
              boxShadow: "0 0 8px 1px var(--accent)",
            }}
          ></span>
          Now scanning: real-time via SSE
        </span>
        <h1>
          Know what's inside your repo{" "}
          <span className="accent-text">before it ships.</span>
        </h1>
        <p className="sub">
          DevAudit connects to your GitHub repository, traces every dependency's
          license back to its source, and flags compliance risk — streamed to
          you as it runs, not queued behind a job.
        </p>
        <div className="hero-ctas">
          <a href="#" className="btn-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.09 0 4.43-2.69 5.4-5.25 5.69.42.36.78 1.08.78 2.17 0 1.57-.01 2.83-.01 3.22 0 .3.2.66.79.55A10.52 10.52 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5Z" />
            </svg>
            Connect a repository
          </a>
          <a href="#report" className="btn-secondary">
            See a sample report →
          </a>
        </div>
        <Terminal />
      </div>
      <div className="hero-visual">
        <NetworkGraph />
        <div className="legend">
          <span>
            <i style={{ backgroundColor: "var(--good)" }}></i>compliant
          </span>
          <span>
            <i style={{ backgroundColor: "var(--warn)" }}></i>review
          </span>
          <span>
            <i style={{ backgroundColor: "var(--risk)" }}></i>blocked
          </span>
        </div>
      </div>
    </section>
  );
}
