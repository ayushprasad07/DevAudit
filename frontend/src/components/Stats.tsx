import React from "react";

export default function Stats() {
  return (
    <div className="stats">
      <div className="stats-inner wrap" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div className="stat">
          <b>SPDX-mapped</b>
          <span>every flagged dependency</span>
        </div>
        <div className="stat">
          <b>&lt; 2 min</b>
          <span>typical scan for mid-size repos</span>
        </div>
        <div className="stat">
          <b>SSE stream</b>
          <span>no job queue, no polling</span>
        </div>
        <div className="stat">
          <b>Read-only</b>
          <span>GitHub OAuth scope</span>
        </div>
      </div>
    </div>
  );
}
