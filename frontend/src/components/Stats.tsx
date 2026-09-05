const stats = [
  ["Every commit", "ready for a fresh audit"],
  ["4 risk signals", "dependencies, secrets, licenses, versions"],
  ["Read-only", "scoped GitHub access"],
  ["One report", "built for engineers and legal"],
];
export default function Stats() {
  return (
    <section className="signal-strip" aria-label="DevAudit capabilities">
      <div className="shell signal-grid">
        {stats.map(([value, label]) => (
          <div className="signal" key={value}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
