import React from "react";

export default function SampleReport() {
  return (
    <section className="wrap" id="report">
      <div className="report-section">
        <div>
          <span className="section-tag">Output</span>
          <h2>A report your legal team can actually read</h2>
          <p
            style={{
              color: "var(--text-muted)",
              marginTop: "16px",
              fontSize: "15.5px",
              lineHeight: "1.7",
            }}
          >
            Each row names the package, its detected license, the risk tier it
            falls into, and why — no digging through a manifest to figure out what
            got flagged.
          </p>
        </div>
        <div className="report-panel">
          <div className="report-bar">
            <i style={{ backgroundColor: "var(--risk)" }}></i>
            <i style={{ backgroundColor: "var(--warn)" }}></i>
            <i style={{ backgroundColor: "var(--good)" }}></i>
            <span>audit_report — devaudit/api-gateway</span>
          </div>
          <table className="report">
            <thead>
              <tr>
                <th>Package</th>
                <th>License</th>
                <th>Risk</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="pkg">flask</td>
                <td>BSD-3-Clause</td>
                <td>
                  <span className="pill good">
                    <i></i>compliant
                  </span>
                </td>
                <td>permissive</td>
              </tr>
              <tr>
                <td className="pkg">pymongo</td>
                <td>Apache-2.0</td>
                <td>
                  <span className="pill good">
                    <i></i>compliant
                  </span>
                </td>
                <td>permissive</td>
              </tr>
              <tr>
                <td className="pkg">some-parser</td>
                <td>LGPL-2.1</td>
                <td>
                  <span className="pill warn">
                    <i></i>review
                  </span>
                </td>
                <td>weak copyleft</td>
              </tr>
              <tr>
                <td className="pkg">legacy-utils</td>
                <td>GPL-3.0</td>
                <td>
                  <span className="pill risk">
                    <i></i>blocked
                  </span>
                </td>
                <td>copyleft, redistribution</td>
              </tr>
              <tr>
                <td className="pkg">inline-widget</td>
                <td>unknown</td>
                <td>
                  <span className="pill risk">
                    <i></i>blocked
                  </span>
                </td>
                <td>no license file found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
