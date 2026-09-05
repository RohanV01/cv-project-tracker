# CV Project Tracker

Tracks multiple chemistry/CRO projects (R&D + Production) as a dashboard, fed by repeatable
Excel imports and direct edits, with the ability to regenerate client-ready "Mock Updates"
style PPTX decks — for one project or many at once — from that single source of truth.

**Fully local. No cloud services, no third-party APIs, no external data egress.**
SQLite on disk, FastAPI on localhost, nothing phones home. See "Data & security" below.

## Status — all phases built

- ✅ **Phase 0** — repo scaffolded, `reference/` seed files in place.
- ✅ **Phase 1** — data model + Excel ingestion (upsert, diff-aware, history log).
- ✅ **Phase 2** — PPT generation from DB: rollup deck (all projects, dynamic slide/row count via
  XML-level slide cloning) + single-project client deck.
- ✅ **Phase 3** — dashboard UI: three real pages — Summary (insights only), R&D (project list +
  create), Production (project list) — plus per-project view (facts, editable remarks, history
  timeline, report generation).
- ✅ **Phase 4** — batch export: rollup + N client decks, zipped, one click.
- ✅ **Create Project** — start tracking a new project from the R&D page (project code, target
  molecule, start/end date); it flows into the same upsert/history pipeline as everything else.
- ✅ Synthetic demo data (`scripts/generate_synthetic_data.py`) — 10 R&D + 12 Production rows
  (39 total projects loaded with the real seed workbook).
- ⏳ **Next**: LLM integration (planned by the user, not yet built). Per the standing security
  constraint below, this must run through a local model — never a cloud LLM API — when it's built.

## Layout

```
reference/          Original + synthetic seed Excel/PPTX files — format templates, untouched by generators.
backend/             FastAPI + SQLAlchemy + SQLite + python-pptx, uv-managed.
  main.py            App entrypoint.
  db.py              Engine/session, DB file at backend/data/cv_tracker.db (gitignored).
  models.py          ORM models (Project, ProjectHistory, IngestionRun) + Pydantic schemas.
  services/
    excel_ingest.py    Excel parsing + upsert/diff/history logic (shared by import and manual edits).
    slide_clone.py     The one low-level python-pptx internals module: slide duplication/removal,
                        bullet-paragraph replacement. Everything else uses the public API only.
    table_rows.py      XML-level table row add/remove for the rollup deck's master table.
    pptx_rollup.py     Builds the "all projects" rollup deck.
    pptx_client_deck.py  Builds a single-project client-facing deck.
  routers/           projects, ingest, exports (rollup / client / batch).
  scripts/generate_synthetic_data.py   Generates a synthetic .xlsx of extra fictional projects.
frontend/            Vite + React + TypeScript.
  src/theme.css      Design tokens (colors, fonts) — pinned light theme matching the reference dashboard.
  src/layout/TopNav.tsx     Navbar: CiVentiChem logo, Summary/R&D/Production tab nav, data-locality pill.
  src/layout/AppShell.tsx   Shared project list/refresh via router Outlet context.
  src/views/SummaryPage.tsx        Executive snapshot + insights only — no project list.
  src/views/RdListPage.tsx         R&D project list + "New Project" creation.
  src/views/ProductionListPage.tsx Production project list.
  src/views/ProjectDetailPage.tsx  Per-project facts, editable remarks, history, report generation.
  src/components/    StatCard, Badge, BarList, ProjectTable, Modal, NewProjectModal, IngestPanel, BatchExportPanel.
```

## Design system

Colors and typography started from nuplay.ai's own SaaS app CSS (shadcn-style tokens: Inter body,
Manrope headings, blue primary, pink accent), then were tuned to match a specific reference
dashboard screenshot the user provided (light theme, top navbar with tab pills, plain stat cards,
funnel-style bar-list insight cards). The theme is **pinned to light** — it does not follow
`prefers-color-scheme` — since different browsers/embedded viewers were reporting different
system preferences, causing the same page to render inconsistently. Dark tokens remain defined
in `theme.css` under `[data-theme="dark"]` for a possible future manual toggle.

The navbar uses the real CiVentiChem logo (`src/assets/civentichem-logo.png`, background made
transparent) and the browser-tab favicon is generated from the same logo
(`frontend/public/favicon-*.png`).

## Data model

- `projects` — one row per project code, flattened R&D + Production fields (a project may
  populate either or both sets of fields).
- `project_history` — append-only. Every Excel import and every manual edit writes a row here
  with a diff (`changed_fields`) and a full snapshot. Nothing is ever overwritten without a trace.
- `ingestion_runs` — audit trail per Excel upload (rows created/updated/unchanged/skipped).

Re-importing the same (or an updated) Excel file is **idempotent**: unchanged rows produce no
history entries, changed fields produce exactly one history row per changed project.

## PPT generation approach

python-pptx has no public API to duplicate an existing, fully-authored slide. `services/slide_clone.py`
is the one module that reaches into its internals (deep-copies the slide XML, remaps image
relationships so pictures aren't broken) — verified safe by round-tripping generated files through
`zipfile.testzip()` and re-opening with `Presentation()`. Every other module only does high-level
text/table mutation. The rollup deck's master table grows/shrinks via simple `<a:tr>` row
clone/delete on the same principle. This is done live at generation time (not a pre-baked template
pool) since testing showed live cloning is fast and reliable enough not to need the extra layer.

## Known data quirk

The R&D sheet's column headers are mislabeled in the source workbook (the project-code column
is literally headed "CV Code", the date columns are headed "PO Date"/"PO Dispatch Date" even
though they hold start/end dates). Because of this, `services/excel_ingest.py` parses both
sheets by **fixed column position**, not by header text — see the comment at the top of that
file if the sheet layout ever changes.

## Running it

Backend:
```bash
cd backend
uv sync
uv run uvicorn main:app --reload --port 8420
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. Ingest `reference/CVChem-Mock-Updates.xlsx` and/or
`reference/synthetic-batch-1.xlsx` via the "Ingest Excel" button (on the Summary page) to seed
the database (or regenerate synthetic data with `uv run python scripts/generate_synthetic_data.py`
— edit `RD_ROW_COUNT`/`PRODUCTION_ROW_COUNT` at the top of that script to change volume).

## Data & security

- SQLite file only — `backend/data/cv_tracker.db` (gitignored, never committed).
- No cloud database, no cloud LLM/API calls, no telemetry SDKs.
- No auth system — single-user local tool by design. If remote access is ever needed, use a
  private tunnel (e.g. Tailscale) rather than deploying to a public host.
- Only `reference/` (the original + synthetic sample Excel/PPTX files) is meant to be committed;
  real project data stays local.

## Known limitations / not built

- No per-project "Route of Synthesis" chemical-structure image upload — the rollup deck's
  project slides reuse the template's placeholder graphic (matches the source mock data, where
  every project slide reused the same two images too).
- The client deck's stage-by-stage progress table (visible in the original CV-K23D reference
  file) isn't populated — our data model doesn't capture that level of per-stage granularity yet.
- No auth/multi-user support (by design, see Data & security).
