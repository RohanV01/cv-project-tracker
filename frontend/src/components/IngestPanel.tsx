import { useRef, useState } from "react";
import { ingestExcel, type IngestionResult } from "../api";

export function IngestPanel({ onIngested }: { onIngested: () => void }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<IngestionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      const res = await ingestExcel(file);
      setResult(res);
      onIngested();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="muted">
        Upload a project-tracker workbook (R&amp;D / Production sheets). Existing projects are
        updated in place with a full audit trail; new projects are created. Nothing is duplicated.
      </p>
      <label className="file-drop">
        <input
          ref={fileInput}
          type="file"
          accept=".xlsx"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        {busy ? "Ingesting…" : "Choose an .xlsx file, or drop it here"}
      </label>
      {error && <p className="error">{error}</p>}
      {result && (
        <div className="ingest-result">
          <strong>{result.filename}</strong>
          <span className="muted"> — sheets: {result.sheet_names_found.join(", ")}</span>
          <div className="ingest-stats">
            <span>{result.rows_processed} processed</span>
            <span className="stat-good">{result.rows_created} created</span>
            <span className="stat-warn">{result.rows_updated} updated</span>
            <span className="muted">{result.rows_unchanged} unchanged</span>
            {result.rows_skipped_errors > 0 && (
              <span className="stat-bad">{result.rows_skipped_errors} skipped</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
