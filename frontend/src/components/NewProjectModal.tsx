import { useState } from "react";
import { createProject } from "../api";

export function NewProjectModal({ onCreated, onClose }: { onCreated: () => void; onClose: () => void }) {
  const [projectCode, setProjectCode] = useState("");
  const [targetMolecule, setTargetMolecule] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!projectCode.trim()) {
      setError("Project code is required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await createProject({
        project_code: projectCode.trim(),
        target_molecule: targetMolecule.trim() || null,
        start_date: startDate || null,
        end_date: endDate || null,
      });
      onCreated();
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
        Kick off tracking for a new project. Once created, updates flow in the same way as any
        other project — via Excel re-import or manual edits on its detail page.
      </p>

      <label className="field-label">Project code</label>
      <input
        className="text-input"
        placeholder="e.g. D4K21"
        value={projectCode}
        onChange={(e) => setProjectCode(e.target.value)}
      />

      <label className="field-label">Target molecule</label>
      <input
        className="text-input"
        placeholder="e.g. CV-9921 free base"
        value={targetMolecule}
        onChange={(e) => setTargetMolecule(e.target.value)}
      />

      <div className="field-row">
        <div>
          <label className="field-label">Start date</label>
          <input className="text-input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="field-label">End date</label>
          <input className="text-input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="modal-actions">
        <button className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="btn btn-primary" disabled={busy} onClick={submit}>
          {busy ? "Creating…" : "Create project"}
        </button>
      </div>
    </div>
  );
}
