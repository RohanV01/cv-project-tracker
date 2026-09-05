export function StatCard({
  label,
  value,
  caption,
}: {
  label: string;
  value: string | number;
  caption?: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label.toUpperCase()}</div>
      <div className="stat-value">{value}</div>
      {caption && <div className="stat-caption">{caption}</div>}
    </div>
  );
}
