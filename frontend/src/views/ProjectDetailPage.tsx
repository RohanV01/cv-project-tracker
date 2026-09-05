import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  exportClientDeck,
  getProjectHistory,
  projectHasProduction,
  projectHasRd,
  updateProject,
  type ProjectHistoryEntry,
} from "../api";
import { useProjects } from "../layout/AppShell";
import { StatusBadge, TrackBadges } from "../components/Badge";

const SOURCE_LABEL: Record<string, string> = {
  excel_import: "Excel import",
  manual_edit: "Manual edit",
  manual_create: "Created",
};

const SOURCE_BADGE: Record<string, string> = {
  excel_import: "badge-track",
  manual_edit: "badge-accent",
  manual_create: "badge-success",
};

export function ProjectDetailPage() {
  const { code = "" } = useParams();
  const { projects, refresh } = useProjects();
  const navigate = useNavigate();
  const project = projects.find((p) => p.project_code === code);

  const [history, setHistory] = useState<ProjectHistoryEntry[]>([]);
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [reportBusy, setReportBusy] = useState(false);

  useEffect(() => {
    if (!project) return;
    setRemarks(project.remarks ?? "");
    getProjectHistory(project.project_code).then(setHistory);
  }, [project?.project_code]);

  if (!project) {
    return (
      <div className="page-header">
        <div>
          <h1>Project not found</h1>
          <Link to="/" className="btn-link">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  async function save() {
    setSaving(true);
    try {
      await updateProject(project!.project_code, { remarks });
      refresh();
      getProjectHistory(project!.project_code).then(setHistory);
    } finally {
      setSaving(false);
    }
  }

  async function generateReport() {
    setReportBusy(true);
    try {
      await exportClientDeck(project!.project_code);
    } finally {
      setReportBusy(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <button className="btn-link" onClick={() => navigate("/")}>
            ← Dashboard
          </button>
          <div className="project-title-row">
            <h1 className="mono">{project.project_code}</h1>
            <StatusBadge status={project.status} />
            <TrackBadges hasRd={projectHasRd(project)} hasProduction={projectHasProduction(project)} />
          </div>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-primary" disabled={reportBusy} onClick={generateReport}>
            {reportBusy ? "Generating…" : "Generate Client Report"}
          </button>
        </div>
      </div>

      <div className="detail-layout">
        <div className="card">
          <h3>Key facts</h3>
          <div className="fact-grid">
            <Fact label="Target molecule" value={project.target_molecule} />
            <Fact label="Team lead" value={project.team_lead} />
            <Fact label="Quantity" value={project.quantity} />
            <Fact label="Start date" value={project.start_date} />
            <Fact label="End date" value={project.end_date} />
            <Fact label="CAS no" value={project.cas_no} />
            <Fact label="Old / New" value={project.old_or_new} />
            <Fact label="Production qty (kg)" value={project.production_quantity_kg} />
            <Fact label="PO date" value={project.po_date} />
            <Fact label="PO dispatch date" value={project.po_dispatch_date} />
            <Fact label="Dispatch date" value={project.dispatch_date} />
            <Fact label="Delay reason" value={project.delay_reason} />
          </div>
        </div>

        <div className="card">
          <h3>Remarks / Overview</h3>
          <p className="muted">
            This feeds the "Overview" section of the generated client report, split into bullets by sentence.
          </p>
          <textarea rows={6} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          <div className="modal-actions">
            <button className="btn btn-primary" disabled={saving} onClick={save}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>History</h3>
        <ul className="history-list">
          {history.map((h) => (
            <li key={h.id}>
              <div className="history-row-head">
                <span className={`badge ${SOURCE_BADGE[h.source] ?? "badge-accent"}`}>
                  {SOURCE_LABEL[h.source] ?? h.source}
                </span>
                <span className="muted">{new Date(h.recorded_at).toLocaleString()}</span>
                {h.source_file && <span className="muted mono">{h.source_file}</span>}
              </div>
              <ul className="history-diff">
                {Object.entries(h.changed_fields).map(([field, change]) => (
                  <li key={field}>
                    <strong>{field}</strong>: <span className="muted">{String(change.old ?? "—")}</span> →{" "}
                    {String(change.new ?? "—")}
                  </li>
                ))}
              </ul>
            </li>
          ))}
          {history.length === 0 && <li className="muted">No history yet.</li>}
        </ul>
      </div>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="fact">
      <span className="fact-label">{label}</span>
      <span className="fact-value">{value || "—"}</span>
    </div>
  );
}
