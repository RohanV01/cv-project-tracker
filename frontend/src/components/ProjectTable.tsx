import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { projectHasProduction, projectHasRd, type Project } from "../api";
import { StatusBadge, TrackBadges } from "./Badge";

export function ProjectTable({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.project_code.toLowerCase().includes(q) ||
        (p.team_lead ?? "").toLowerCase().includes(q) ||
        (p.remarks ?? "").toLowerCase().includes(q)
    );
  }, [projects, query]);

  return (
    <div className="card">
      <div className="card-header">
        <h3>All projects</h3>
        <input
          className="table-search"
          placeholder="Filter by code, lead, or remarks…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Track</th>
              <th>Team Lead</th>
              <th>Status</th>
              <th>Last updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.project_code} onClick={() => navigate(`/projects/${encodeURIComponent(p.project_code)}`)}>
                <td className="mono">{p.project_code}</td>
                <td>
                  <TrackBadges hasRd={projectHasRd(p)} hasProduction={projectHasProduction(p)} />
                </td>
                <td>{p.team_lead ?? "—"}</td>
                <td>
                  <StatusBadge onTime={p.on_time} />
                </td>
                <td className="muted">{new Date(p.updated_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="muted empty-row">
                  No projects match "{query}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
