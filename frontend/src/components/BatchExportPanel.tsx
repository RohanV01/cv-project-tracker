import { useState } from "react";
import { exportBatch, type Project } from "../api";

export function BatchExportPanel({ projects, onClose }: { projects: Project[]; onClose: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set(projects.map((p) => p.project_code)));
  const [includeRollup, setIncludeRollup] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(code: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === projects.length ? new Set() : new Set(projects.map((p) => p.project_code))));
  }

  async function run() {
    setBusy(true);
    setError(null);
    try {
      await exportBatch(Array.from(selected), includeRollup);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="muted">
        Generate the internal rollup deck and a client-facing single-project deck for every
        project you select — all from the current database state, bundled into one zip.
      </p>

      <label className="checkbox-row emphasis">
        <input type="checkbox" checked={includeRollup} onChange={(e) => setIncludeRollup(e.target.checked)} />
        Include internal rollup deck (always covers all {projects.length} projects)
      </label>

      <div className="batch-list-header">
        <span>Client decks to generate ({selected.size} selected)</span>
        <button className="btn-link" onClick={toggleAll}>
          {selected.size === projects.length ? "Clear all" : "Select all"}
        </button>
      </div>
      <div className="batch-list">
        {projects.map((p) => (
          <label key={p.project_code} className="checkbox-row">
            <input type="checkbox" checked={selected.has(p.project_code)} onChange={() => toggle(p.project_code)} />
            <span className="mono">{p.project_code}</span>
            <span className="muted">{p.team_lead ?? "—"}</span>
          </label>
        ))}
      </div>

      {error && <p className="error">{error}</p>}

      <div className="modal-actions">
        <button className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="btn btn-primary" disabled={busy} onClick={run}>
          {busy ? "Generating…" : `Generate & download zip`}
        </button>
      </div>
    </div>
  );
}
