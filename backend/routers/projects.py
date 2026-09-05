from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from db import get_session
from models import Project, ProjectCreate, ProjectHistoryRead, ProjectRead, ProjectUpdate
from services.excel_ingest import upsert_project

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("", response_model=list[ProjectRead])
def list_projects(session: Session = Depends(get_session)):
    projects = session.execute(select(Project).order_by(Project.project_code)).scalars().all()
    return projects


@router.post("", response_model=ProjectRead, status_code=201)
def create_project(payload: ProjectCreate, session: Session = Depends(get_session)):
    project_code = payload.project_code.strip().upper()
    if not project_code:
        raise HTTPException(status_code=400, detail="project_code is required")
    existing = session.query(Project).filter_by(project_code=project_code).one_or_none()
    if existing is not None:
        raise HTTPException(status_code=409, detail=f"Project '{project_code}' already exists")

    fields = payload.model_dump(exclude={"project_code"})
    project, _is_new, _changed = upsert_project(session, project_code, fields, source="manual_create", source_file=None)
    session.commit()
    session.refresh(project)
    return project


@router.get("/{project_code}", response_model=ProjectRead)
def get_project(project_code: str, session: Session = Depends(get_session)):
    project = session.query(Project).filter_by(project_code=project_code).one_or_none()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.get("/{project_code}/history", response_model=list[ProjectHistoryRead])
def get_project_history(project_code: str, session: Session = Depends(get_session)):
    project = session.query(Project).filter_by(project_code=project_code).one_or_none()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project.history


@router.patch("/{project_code}", response_model=ProjectRead)
def update_project(project_code: str, update: ProjectUpdate, session: Session = Depends(get_session)):
    fields = update.model_dump(exclude_unset=True)
    project, _is_new, _changed = upsert_project(session, project_code, fields, source="manual_edit", source_file=None)
    session.commit()
    session.refresh(project)
    return project
