import io
import zipfile
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from db import get_session
from models import Project
from services.pptx_client_deck import generate_client_deck
from services.pptx_rollup import generate_rollup_pptx

router = APIRouter(prefix="/api/exports", tags=["exports"])


@router.get("/rollup")
def export_rollup(session: Session = Depends(get_session)):
    projects = session.execute(select(Project).order_by(Project.project_code)).scalars().all()
    path = generate_rollup_pptx(list(projects))
    return FileResponse(path, filename=path.name, media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation")


@router.get("/client/{project_code}")
def export_client_deck(project_code: str, session: Session = Depends(get_session)):
    project = session.query(Project).filter_by(project_code=project_code).one_or_none()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    path = generate_client_deck(project)
    return FileResponse(path, filename=path.name, media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation")


class BatchExportRequest(BaseModel):
    project_codes: list[str] | Literal["all"] = "all"
    include_rollup: bool = True


@router.post("/batch")
def export_batch(req: BatchExportRequest, session: Session = Depends(get_session)):
    all_projects = session.execute(select(Project).order_by(Project.project_code)).scalars().all()

    if req.project_codes == "all":
        selected = list(all_projects)
    else:
        code_set = set(req.project_codes)
        selected = [p for p in all_projects if p.project_code in code_set]

    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        if req.include_rollup:
            rollup_path = generate_rollup_pptx(list(all_projects))
            zf.write(rollup_path, arcname=rollup_path.name)
        for project in selected:
            client_path = generate_client_deck(project)
            zf.write(client_path, arcname=client_path.name)

    buffer.seek(0)
    filename = "cv-project-decks.zip"
    return StreamingResponse(
        buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
