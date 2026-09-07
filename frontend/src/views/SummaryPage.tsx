import { useMemo, useState } from "react";
import { exportRollup, projectHasProduction, projectHasRd, type Project } from "../api";
import { useProjects } from "../layout/AppShell";
import { StatCard } from "../components/StatCard";
import { Modal } from "../components/Modal";
import { IngestPanel } from "../components/IngestPanel";
import { BatchExportPanel } from "../components/BatchExportPanel";
import { BarList } from "../components/BarList";
import { PieChart } from "../components/PieChart";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Days past the relevant due date for an at-risk project (mirrors backend compute_status). */
function overdueDays(p: Project): number | null {
  if (p.status !== "at_risk") return null;
  const dueStr = p.po_dispatch_date ?? p.end_date;
  if (!dueStr) return null;
  const due = new Date(dueStr).getTime();
  if (Number.isNaN(due)) return null;
  return Math.max(0, Math.round((Date.now() - due) / MS_PER_DAY));
}

export function SummaryPage() {
  const { projects, refresh } = useProjects();
  const [showIngest, setShowIngest] = useState(false);
  const [showBatch, setShowBatch] = useState(false);
  const [rollupBusy, setRollupBusy] = useState(false);

  const stats = useMemo(() => {
    const total = projects.length;
    const onTrack = projects.filter((p) => p.status === "on_time").length;
    const atRisk = projects.filter((p) => p.status === "at_risk").length;
    const noData = projects.filter((p) => p.status === "no_data").length;
    const rd = projects.filter(projectHasRd).length;
    const production = projects.filter(projectHasProduction).length;

    let delayed1to2 = 0;
    let delayedOver2 = 0;
    for (const p of projects) {
      const days = overdueDays(p);
      if (days === null) continue;
      if (days <= 14) delayed1to2 += 1;
      else delayedOver2 += 1;
    }

    return { total, onTrack, atRisk, noData, rd, production, delayed1to2, delayedOver2 };
  }, [projects]);

  const statusPie = useMemo(
    () => [
      { label: "On track", value: stats.onTrack, color: "var(--success)" },
      { label: "At risk", value: stats.atRisk, color: "var(--destructive)" },
      { label: "No status recorded", value: stats.noData, color: "var(--chart-5)" },
    ],
    [stats]
  );

  const trackPie = useMemo(
    () => [
      { label: "R&D", value: stats.rd, color: "var(--chart-1)" },
      { label: "Production", value: stats.production, color: "var(--chart-3)" },
    ],
    [stats]
  );

  const delaySeverityBars = useMemo(
    () => [
      { label: "On track", value: stats.onTrack, color: "var(--success)" },
      { label: "Delayed 1–2 wks", value: stats.delayed1to2, color: "var(--chart-4)" },
      { label: "Delayed > 2 wks", value: stats.delayedOver2, color: "var(--destructive)" },
      { label: "No status", value: stats.noData, color: "var(--chart-5)" },
    ],
    [stats]
  );

  const teamLeadBars = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) {
      if (!p.team_lead) continue;
      counts.set(p.team_lead, (counts.get(p.team_lead) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label, value }));
  }, [projects]);

  const delayReasonBars = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) {
      if (p.status !== "at_risk" || !p.delay_reason) continue;
      const label = p.delay_reason.trim();
      if (!label) continue;
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label, value }));
  }, [projects]);

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
        <StatCard label="R&D projects" value={stats.rd} caption={stats.total ? `${stats.rd} / ${stats.total}` : "—"} />
        <StatCard
          label="Production projects"
          value={stats.production}
          caption={stats.total ? `${stats.production} / ${stats.total}` : "—"}
        />
        <StatCard
          label="On track"
          value={stats.onTrack}
          caption={stats.total ? `${stats.onTrack} / ${stats.total} on time` : "—"}
        />
        <StatCard label="Delayed 1–2 wks" value={stats.delayed1to2} caption="Past due, within 2 weeks" />
        <StatCard label="Delayed > 2 wks" value={stats.delayedOver2} caption="Past due, over 2 weeks" />
      </div>

      <div className="section-header">
        <div>
          <div className="eyebrow">Insights</div>
          <p className="muted">Status, track, delay severity, ownership, and root-cause distribution across the whole program.</p>
        </div>
      </div>

      <div className="insight-grid">
        <div className="card">
          <div className="card-eyebrow">STATUS</div>
          <p className="muted">On-time status across all projects.</p>
          <PieChart slices={statusPie} />
        </div>
        <div className="card">
          <div className="card-eyebrow">TRACK</div>
          <p className="muted">R&amp;D vs. Production coverage across all projects.</p>
          <PieChart slices={trackPie} />
        </div>
        <div className="card">
          <div className="card-eyebrow">DELAY SEVERITY</div>
          <p className="muted">How far past due the at-risk projects are.</p>
          <BarList rows={delaySeverityBars} />
        </div>
        <div className="card">
          <div className="card-eyebrow">TEAM LEAD WORKLOAD</div>
          <p className="muted">Project count per team lead, across both tracks.</p>
          {teamLeadBars.length > 0 ? (
            <BarList rows={teamLeadBars} />
          ) : (
            <p className="muted">No team leads recorded yet.</p>
          )}
        </div>
        <div className="card">
          <div className="card-eyebrow">DELAY ROOT CAUSES</div>
          <p className="muted">Reasons recorded against at-risk production projects.</p>
          {delayReasonBars.length > 0 ? (
            <BarList rows={delayReasonBars} />
          ) : (
            <p className="muted">No delay reasons recorded — every at-risk project is missing a root cause note.</p>
          )}
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
