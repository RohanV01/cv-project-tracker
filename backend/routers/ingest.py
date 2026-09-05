import shutil
import tempfile
from pathlib import Path

from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from db import get_session
from models import IngestionResult, IngestionRun
from services.excel_ingest import ingest_workbook

router = APIRouter(prefix="/api/ingest", tags=["ingest"])


@router.post("/excel", response_model=IngestionResult)
def ingest_excel(file: UploadFile, session: Session = Depends(get_session)):
    with tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = Path(tmp.name)

    try:
        run = ingest_workbook(tmp_path, session, filename=file.filename)
    finally:
        tmp_path.unlink(missing_ok=True)

    return IngestionResult(
        filename=run.filename,
        sheet_names_found=run.sheet_names_found,
        rows_processed=run.rows_processed,
        rows_created=run.rows_created,
        rows_updated=run.rows_updated,
        rows_unchanged=run.rows_unchanged,
        rows_skipped_errors=run.rows_skipped_errors,
        status=run.status,
    )


@router.get("/batches")
def list_batches(session: Session = Depends(get_session)):
    runs = session.execute(select(IngestionRun).order_by(IngestionRun.started_at.desc()).limit(20)).scalars().all()
    return [
        {
            "id": r.id,
            "filename": r.filename,
            "started_at": r.started_at,
            "rows_created": r.rows_created,
            "rows_updated": r.rows_updated,
            "rows_unchanged": r.rows_unchanged,
            "rows_skipped_errors": r.rows_skipped_errors,
            "status": r.status,
        }
        for r in runs
    ]
