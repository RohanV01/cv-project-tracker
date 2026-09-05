export function StatusBadge({ onTime }: { onTime: boolean | null }) {
  if (onTime === null) {
    return <span className="badge badge-neutral">No data</span>;
  }
  return onTime ? (
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
