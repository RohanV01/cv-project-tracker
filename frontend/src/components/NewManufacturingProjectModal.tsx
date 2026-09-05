import { useState } from "react";
import { createProject } from "../api";

export function NewManufacturingProjectModal({ onCreated, onClose }: { onCreated: () => void; onClose: () => void }) {
  const [projectCode, setProjectCode] = useState("");
  const [targetMolecule, setTargetMolecule] = useState("");
  const [teamLead, setTeamLead] = useState("");
  const [oldOrNew, setOldOrNew] = useState("");
  const [casNo, setCasNo] = useState("");
  const [productionQuantityKg, setProductionQuantityKg] = useState("");
  const [poDate, setPoDate] = useState("");
  const [poDispatchDate, setPoDispatchDate] = useState("");
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
        team_lead: teamLead.trim() || null,
        old_or_new: oldOrNew || null,
        cas_no: casNo.trim() || null,
        production_quantity_kg: productionQuantityKg.trim() || null,
        po_date: poDate || null,
        po_dispatch_date: poDispatchDate || null,
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
        Kick off tracking for a new manufacturing project. Once created, updates flow in the same
        way as any other project — via Excel re-import or manual edits on its detail page.
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
          <label className="field-label">Team lead</label>
          <input className="text-input" value={teamLead} onChange={(e) => setTeamLead(e.target.value)} />
        </div>
        <div>
          <label className="field-label">Old / New</label>
          <select className="text-input" value={oldOrNew} onChange={(e) => setOldOrNew(e.target.value)}>
            <option value="">—</option>
            <option value="Old">Old</option>
            <option value="New">New</option>
          </select>
        </div>
      </div>

      <div className="field-row">
        <div>
          <label className="field-label">CAS no</label>
          <input className="text-input" value={casNo} onChange={(e) => setCasNo(e.target.value)} />
        </div>
        <div>
          <label className="field-label">Production qty (kg)</label>
          <input
            className="text-input"
            value={productionQuantityKg}
            onChange={(e) => setProductionQuantityKg(e.target.value)}
          />
        </div>
      </div>

      <div className="field-row">
        <div>
          <label className="field-label">PO date</label>
          <input className="text-input" type="date" value={poDate} onChange={(e) => setPoDate(e.target.value)} />
        </div>
        <div>
          <label className="field-label">PO dispatch date</label>
          <input
            className="text-input"
            type="date"
            value={poDispatchDate}
            onChange={(e) => setPoDispatchDate(e.target.value)}
          />
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
