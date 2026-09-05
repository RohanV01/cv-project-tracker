export function StatusBadge({ status }: { status: "on_time" | "at_risk" | "no_data" }) {
  if (status === "no_data") {
    return <span className="badge badge-neutral">No data</span>;
  }
  return status === "on_time" ? (
    <span className="badge badge-success">On track</span>
  ) : (
    <span className="badge badge-warning">At risk</span>
  );
}

export function TrackBadges({ hasRd, hasProduction }: { hasRd: boolean; hasProduction: boolean }) {
  return (
    <span className="track-badges">
      {hasRd && <span className="badge badge-track">R&amp;D</span>}
      {hasProduction && <span className="badge badge-track">Production</span>}
    </span>
  );
}
