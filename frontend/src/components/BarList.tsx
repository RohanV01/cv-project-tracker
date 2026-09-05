export interface BarListRow {
  label: string;
  value: number;
  color?: string;
}

export function BarList({ rows }: { rows: BarListRow[] }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  const palette = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

  return (
    <div className="bar-list">
      {rows.map((row, i) => (
        <div className="bar-list-row" key={row.label}>
          <span className="bar-list-label">{row.label}</span>
          <span className="bar-list-track">
            <span
              className="bar-list-fill"
              style={{
                width: `${Math.max((row.value / max) * 100, row.value > 0 ? 2 : 0)}%`,
                background: row.color ?? palette[i % palette.length],
              }}
            />
          </span>
          <span className="bar-list-value">{row.value}</span>
        </div>
      ))}
    </div>
  );
}
