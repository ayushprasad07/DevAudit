import React from "react";

export default function Features() {
  return (
    <section className="wrap" id="features">
      <div className="section-head">
        <span className="section-tag">Under the hood</span>
        <h2>Built for how audits actually happen</h2>
        <p>
          Each service does one job — connecting, scanning, and reporting stay
          separate, so the pipeline is easy to reason about.
        </p>
      </div>
      <div className="features">
        <div className="feature">
          <div className="fi">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.09 0 4.43-2.69 5.4-5.25 5.69.42.36.78 1.08.78 2.17 0 1.57-.01 2.83-.01 3.22 0 .3.2.66.79.55A10.52 10.52 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5Z" />
            </svg>
          </div>
          <h4>github oauth 2.0</h4>
          <p>
            Read-only repository access, scoped to what you choose to audit and
            revocable anytime.
          </p>
        </div>
        <div className="feature">
          <div className="fi">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
            </svg>
          </div>
          <h4>sse live scanning</h4>
          <p>
            Watch the audit progress in real time, streamed straight to the
            browser — no polling, no background queue.
          </p>
        </div>
        <div className="feature">
          <div className="fi">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
          </div>
          <h4>license risk scoring</h4>
          <p>
            Every dependency mapped to an SPDX identifier and sorted into a
            clear risk tier.
          </p>
        </div>
        <div className="feature">
          <div className="fi">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
            </svg>
          </div>
          <h4>contextual rag analysis</h4>
          <p>
            Source files are read in full, so context that a manifest alone
            would miss still gets caught.
          </p>
        </div>
        <div className="feature">
          <div className="fi">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <ellipse cx="12" cy="5" rx="8" ry="3" />
              <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
              <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
            </svg>
          </div>
          <h4>audit history</h4>
          <p>
            Every past run is stored in MongoDB, so you can compare results
            across scans over time.
          </p>
        </div>
        <div className="feature">
          <div className="fi">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 15V3M7 10l5 5 5-5" />
              <path d="M4 21h16" />
            </svg>
          </div>
          <h4>exportable reports</h4>
          <p>
            Hand a clean compliance summary to legal or engineering leadership
            without extra formatting.
          </p>
        </div>
      </div>
    </section>
  );
}
