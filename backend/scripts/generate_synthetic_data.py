"""Generates a synthetic Excel workbook (same column layout as reference/CVChem-Mock-Updates.xlsx)
with additional fictional projects, for demoing the dashboard with a realistic volume of data.
Run: uv run python scripts/generate_synthetic_data.py
Then ingest the output file (reference/synthetic-batch-1.xlsx) via the API or ingest_workbook().
"""
from __future__ import annotations

import datetime as dt
import random
from pathlib import Path

import openpyxl

random.seed(7)

OUTPUT_PATH = Path(__file__).parent.parent.parent / "reference" / "synthetic-batch-1.xlsx"

RD_ROW_COUNT = 10
PRODUCTION_ROW_COUNT = 12

TEAM_LEADS_RD = ["Leader A", "Leader B", "Leader C", "Leader D", "Leader E"]
TEAM_LEADS_PROD = ["A", "B", "C", "D", "E", "F"]
DELAY_REASONS = ["Reactor Availability", "Raw Materials Late", "Shipping Delay", "QC Retest", None, None]
OLD_NEW = ["Old", "New"]

COMPOUNDS = ["compound-1", "compound-2", "compound-3", "compound-4", "compound-5", "intermediate-A", "intermediate-B", "intermediate-C"]

RD_NARRATIVE_TEMPLATES = [
    "{qty} g of stage {stage} compound converted to stage {stage2} and got {yield_g} g with {purity}% purity by HPLC ({yield_pct}% yields).",
    "{qty} g of stage {stage} compound was attempted to convert to stage {stage2} using catalyst, reaction monitored by TLC, isolated {yield_g} g crude with {purity}% purity by HPLC.",
    "COA for {qty} g has been shared. {ship_g} g of sample sent to customer, waiting for feedback.",
    "{ship_g} g was shipped on {ship_date}, ~{remaining_g} g is in hand.",
    "Started work on new scheme for this project; route confirmed with the technical team.",
    "Raw materials have been ordered; reaction setup planned for next week.",
    "Tweaking the final stage to improve yields; current best is {purity}% purity by HPLC.",
    "{qty} g of crude product purified by column chromatography, got {yield_g} g with {purity}% purity, confirmed by HNMR.",
    "Scale-up trial for stage {stage} completed at {qty} g scale; {yield_pct}% yield, within spec.",
    "Customer requested a re-run of stage {stage} due to an out-of-spec impurity; investigation in progress.",
    "Analytical method development for the final compound is complete; validation batch scheduled next week.",
    "{qty} g stability sample pulled for the 3-month timepoint; results pending.",
    "Process safety review completed for stage {stage}; no blocking concerns raised.",
]

PROD_NARRATIVE_TEMPLATES = [
    "{multi}x{qty} g of {c1} converted to {c2} and obtained {yield_g} kg solid material with {purity}% purity by GC.",
    "{multi}x{qty} g of {c1} is being converted to {c2}, reaction in progress.",
    "{qty} g of {c1} converted to {c2} and obtained {yield_g} g liquid material with {purity}% purity by GC.",
]

RD_CODE_PREFIXES = ["D", "E", "F", "G", "H", "J", "K", "L"]
PROD_CODE_PREFIXES = ["S", "T", "U", "V", "W", "X", "Y", "Z"]


def _rand_date(start: dt.date, end: dt.date) -> dt.date:
    delta = (end - start).days
    return start + dt.timedelta(days=random.randint(0, max(delta, 0)))


def _rd_code(i: int) -> str:
    return f"{random.choice(RD_CODE_PREFIXES)}{random.randint(0,9)}{random.choice('ABCDEFGHJKLMNPQR')}{random.randint(10,99)}"


def _prod_code(i: int) -> str:
    return f"{random.choice(PROD_CODE_PREFIXES)}{random.randint(1,9)}{random.choice('ABCDEFGHJKLMNPQR')}"


def _rd_remarks() -> str:
    if random.random() < 0.08:
        return ""  # occasional genuinely blank remarks, matching messy real-world data
    n = random.randint(1, 4)
    templates = random.sample(RD_NARRATIVE_TEMPLATES, min(n, len(RD_NARRATIVE_TEMPLATES)))
    sentences = []
    for t in templates:
        stage = random.randint(1, 9)
        sentences.append(
            t.format(
                qty=random.choice([2, 5, 10, 20, 50, 100, 200, 500, 750, 1000, 1500]),
                stage=stage,
                stage2=stage + 1,
                yield_g=round(random.uniform(2, 1200), 1),
                purity=round(random.uniform(85, 99.9), 1),
                yield_pct=random.randint(30, 97),
                ship_g=random.choice([1, 2, 5, 10, 20, 25]),
                remaining_g=random.choice([3, 5, 15, 25, 40, 60]),
                ship_date=_rand_date(dt.date(2026, 5, 1), dt.date(2026, 9, 1)).strftime("%d/%m/%y"),
            )
        )
    return " ".join(sentences)


def generate_rd_rows(n: int, start_sno: int) -> list[list]:
    rows = []
    for i in range(n):
        code = _rd_code(i)
        team_lead = random.choice(TEAM_LEADS_RD) if random.random() > 0.05 else None
        qty_choice = random.random()
        if qty_choice < 0.5:
            qty = f"{random.choice([1, 2, 5, 10, 20, 50])} g"
        elif qty_choice < 0.85:
            qty = f"{random.choice([100, 200, 500])} g"
        else:
            qty = f"{round(random.uniform(0.5, 3.5), 1)} kg"
        start_date = _rand_date(dt.date(2026, 2, 1), dt.date(2026, 8, 20))
        end_date = start_date + dt.timedelta(days=random.randint(15, 120))
        on_time = random.choices(["YES", "NO"], weights=[55, 45])[0]
        remarks = _rd_remarks()
        rows.append([start_sno + i, code, qty, team_lead, start_date, end_date, on_time, remarks])
    return rows


def generate_production_rows(n: int, start_sno: int) -> list[list]:
    rows = []
    for i in range(n):
        code = _prod_code(i)
        old_new = random.choice(OLD_NEW)
        cas_no = f"{''.join(random.choices('ABCD', k=3))}-{''.join(random.choices('ABCD', k=2))}-{random.choice('ABCD')}"
        qty_kg = random.choice([25, 50, 75, 100, 150, 200, 250, 300, 400, 500])
        team_lead = random.choice(TEAM_LEADS_PROD)
        po_date = _rand_date(dt.date(2026, 4, 1), dt.date(2026, 8, 15))
        po_dispatch = po_date + dt.timedelta(days=random.randint(14, 30))
        has_dispatched = random.random() > 0.45
        dispatch_date = po_dispatch + dt.timedelta(days=random.randint(2, 12)) if has_dispatched else None
        delay_reason = random.choice(DELAY_REASONS) if not has_dispatched else None
        rows.append([start_sno + i, code, old_new, cas_no, qty_kg, team_lead, po_date, po_dispatch, dispatch_date, delay_reason])
    return rows


def main() -> None:
    wb = openpyxl.Workbook()
    rd_ws = wb.active
    rd_ws.title = "R&D"
    rd_ws.append(["S.no", "CV Code ", "Quantity", "Team Lead", "PO Date ", "PO Dispatch Date ", "On Time", "Remarks"])
    for row in generate_rd_rows(RD_ROW_COUNT, start_sno=1):
        rd_ws.append(row)

    prod_ws = wb.create_sheet("Production")
    prod_ws.append(
        ["S.no", "Project Code ", "Old/New", "CAS no", "Quantity (kgs)", "Team Lead", "PO Date", "PO Dispatch Date ", "Disptach date ", "Reason for Delay "]
    )
    for row in generate_production_rows(PRODUCTION_ROW_COUNT, start_sno=1):
        prod_ws.append(row)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    wb.save(OUTPUT_PATH)
    print(f"Wrote {OUTPUT_PATH} — {RD_ROW_COUNT} R&D rows + {PRODUCTION_ROW_COUNT} Production rows")


if __name__ == "__main__":
    main()
