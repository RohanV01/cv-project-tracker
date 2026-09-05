import { useMemo, useState } from "react";
import { exportRollup, projectHasProduction, projectHasRd } from "../api";
import { useProjects } from "../layout/AppShell";
import { StatCard } from "../components/StatCard";
import { Modal } from "../components/Modal";
import { IngestPanel } from "../components/IngestPanel";
import { BatchExportPanel } from "../components/BatchExportPanel";
import { BarList } from "../components/BarList";

export function SummaryPage() {
  const { projects, refresh } = useProjects();
  const [showIngest, setShowIngest] = useState(false);
  const [showBatch, setShowBatch] = useState(false);
  const [rollupBusy, setRollupBusy] = useState(false);

  const stats = useMemo(() => {
    const total = projects.length;
    const onTrack = projects.filter((p) => p.on_time === true).length;
    const atRisk = projects.filter((p) => p.on_time === false).length;
    const noData = projects.filter((p) => p.on_time === null).length;
    return { total, onTrack, atRisk, noData };
  }, [projects]);

  const statusBars = useMemo(
    () => [
      { label: "On track", value: stats.onTrack, color: "var(--success)" },
      { label: "At risk", value: stats.atRisk, color: "var(--destructive)" },
      { label: "No status recorded", value: stats.noData, color: "var(--chart-5)" },
    ],
    [stats]
  );

  const trackBars = useMemo(
    () => [
      { label: "R&D", value: projects.filter(projectHasRd).length, color: "var(--chart-1)" },
      { label: "Production", value: projects.filter(projectHasProduction).length, color: "var(--chart-3)" },
    ],
    [projects]
  );

  async function handleRollup() {
    setRollupBusy(true);
    try {
      await exportRollup();
    } finally {
      setRollupBusy(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Program-level pulse across every tracked project.</p>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-secondary" onClick={() => setShowIngest(true)}>
            Ingest Excel
          </button>
          <button className="btn btn-secondary" disabled={rollupBusy} onClick={handleRollup}>
            {rollupBusy ? "Generating…" : "Generate Rollup Deck"}
          </button>
          <button className="btn btn-primary" onClick={() => setShowBatch(true)}>
            Batch Export
          </button>
        </div>
      </div>

      <div className="section-header">
        <div>
          <div className="eyebrow">Executive snapshot</div>
          <p className="muted">
            Key metrics for <strong>all projects</strong>.
          </p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Total projects" value={stats.total} caption="All time" />
        <StatCard
          label="On track"
          value={stats.onTrack}
          caption={stats.total ? `${stats.onTrack} / ${stats.total} on time` : "—"}
        />
        <StatCard
          label="At risk"
          value={stats.atRisk}
          caption={stats.total ? `${stats.atRisk} / ${stats.total} delayed` : "—"}
        />
      </div>

      <div className="section-header">
        <div>
          <div className="eyebrow">Insights</div>
          <p className="muted">Status and track distribution across the whole program.</p>
        </div>
      </div>

      <div className="insight-grid">
        <div className="card">
          <div className="card-eyebrow">STATUS</div>
          <p className="muted">On-time status across all projects.</p>
          <BarList rows={statusBars} />
        </div>
        <div className="card">
          <div className="card-eyebrow">TRACK</div>
          <p className="muted">R&amp;D vs. Production coverage across all projects.</p>
          <BarList rows={trackBars} />
        </div>
      </div>

      {showIngest && (
        <Modal title="Ingest Excel update" onClose={() => setShowIngest(false)}>
          <IngestPanel onIngested={refresh} />
        </Modal>
      )}

      {showBatch && (
        <Modal title="Batch export" onClose={() => setShowBatch(false)}>
          <BatchExportPanel projects={projects} onClose={() => setShowBatch(false)} />
        </Modal>
      )}
    </>
  );
}
