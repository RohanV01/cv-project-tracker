const BASE = "http://localhost:8420";

export interface Project {
  id: number;
  project_code: string;
  target_molecule: string | null;
  team_lead: string | null;
  quantity: string | null;
  start_date: string | null;
  end_date: string | null;
  on_time: boolean | null;
  remarks: string | null;
  old_or_new: string | null;
  cas_no: string | null;
  production_quantity_kg: string | null;
  po_date: string | null;
  po_dispatch_date: string | null;
  dispatch_date: string | null;
  delay_reason: string | null;
  updated_at: string;
  status: "on_time" | "at_risk" | "no_data";
}

export interface ProjectHistoryEntry {
  id: number;
  source: string;
  source_file: string | null;
  changed_fields: Record<string, { old: unknown; new: unknown }>;
  recorded_at: string;
}

export interface IngestionResult {
  filename: string;
  sheet_names_found: string[];
  rows_processed: number;
  rows_created: number;
  rows_updated: number;
  rows_unchanged: number;
  rows_skipped_errors: number;
  status: string;
}

export function projectHasRd(p: Project): boolean {
  return p.start_date !== null || p.end_date !== null || p.on_time !== null;
}

export function projectHasProduction(p: Project): boolean {
  return p.cas_no !== null || p.po_date !== null || p.dispatch_date !== null;
}

export async function listProjects(): Promise<Project[]> {
  const res = await fetch(`${BASE}/api/projects`);
  if (!res.ok) throw new Error(`listProjects failed: ${res.status}`);
  return res.json();
}

export async function getProjectHistory(projectCode: string): Promise<ProjectHistoryEntry[]> {
  const res = await fetch(`${BASE}/api/projects/${encodeURIComponent(projectCode)}/history`);
  if (!res.ok) throw new Error(`getProjectHistory failed: ${res.status}`);
  return res.json();
}

export interface ProjectCreate {
  project_code: string;
  target_molecule?: string | null;
  team_lead?: string | null;
  quantity?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  old_or_new?: string | null;
  cas_no?: string | null;
  production_quantity_kg?: string | null;
  po_date?: string | null;
  po_dispatch_date?: string | null;
}

export async function createProject(payload: ProjectCreate): Promise<Project> {
  const res = await fetch(`${BASE}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    if (res.status === 409) throw new Error(`Project "${payload.project_code}" already exists`);
    throw new Error(`createProject failed: ${res.status}`);
  }
  return res.json();
}

export async function updateProject(
  projectCode: string,
  fields: Partial<Project>
): Promise<Project> {
  const res = await fetch(`${BASE}/api/projects/${encodeURIComponent(projectCode)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
  if (!res.ok) throw new Error(`updateProject failed: ${res.status}`);
  return res.json();
}

export async function ingestExcel(file: File): Promise<IngestionResult> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/api/ingest/excel`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`ingestExcel failed: ${res.status}`);
  return res.json();
}

async function downloadBlob(url: string, init: RequestInit | undefined, fallbackFilename: string): Promise<void> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`download failed: ${res.status}`);
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="?([^";]+)"?/);
  const filename = match ? match[1] : fallbackFilename;

  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

export async function exportRollup(): Promise<void> {
  await downloadBlob(`${BASE}/api/exports/rollup`, undefined, "rollup.pptx");
}

export async function exportClientDeck(projectCode: string): Promise<void> {
  await downloadBlob(
    `${BASE}/api/exports/client/${encodeURIComponent(projectCode)}`,
    undefined,
    `${projectCode}-client-update.pptx`
  );
}

export async function exportBatch(projectCodes: string[] | "all", includeRollup: boolean): Promise<void> {
  await downloadBlob(
    `${BASE}/api/exports/batch`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_codes: projectCodes, include_rollup: includeRollup }),
    },
    "cv-project-decks.zip"
  );
}
