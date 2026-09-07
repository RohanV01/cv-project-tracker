export interface PieSlice {
  label: string;
  value: number;
  color: string;
}

const DEFAULT_PALETTE = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export function PieChart({ slices, size = 150 }: { slices: PieSlice[]; size?: number }) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const radius = 15.9155; // circumference == 100 in this unit
  let cumulative = 0;

  return (
    <div className="pie-chart-row">
      <svg viewBox="0 0 36 36" width={size} height={size} className="pie-chart-svg">
        {total === 0 ? (
          <circle cx="18" cy="18" r={radius} fill="none" stroke="var(--muted)" strokeWidth="6" />
        ) : (
          slices
            .filter((s) => s.value > 0)
            .map((s, i) => {
              const pct = (s.value / total) * 100;
              const dashArray = `${pct} ${100 - pct}`;
              const dashOffset = 25 - cumulative;
              cumulative += pct;
              return (
                <circle
                  key={s.label}
                  cx="18"
                  cy="18"
                  r={radius}
                  fill="none"
                  stroke={s.color ?? DEFAULT_PALETTE[i % DEFAULT_PALETTE.length]}
                  strokeWidth="6"
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                />
              );
            })
        )}
        <text x="18" y="19" textAnchor="middle" className="pie-chart-total">
          {total}
        </text>
      </svg>
      <ul className="pie-chart-legend">
        {slices.map((s, i) => (
          <li key={s.label}>
            <span className="pie-chart-swatch" style={{ background: s.color ?? DEFAULT_PALETTE[i % DEFAULT_PALETTE.length] }} />
            <span className="pie-chart-legend-label">{s.label}</span>
            <span className="pie-chart-legend-value">
              {s.value} {total ? `(${Math.round((s.value / total) * 100)}%)` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
