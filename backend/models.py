from __future__ import annotations

import datetime as dt
from typing import Literal

from pydantic import BaseModel, computed_field
from sqlalchemy import JSON, Boolean, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

ProjectStatus = Literal["on_time", "at_risk", "no_data"]


def compute_status(
    end_date: dt.date | None,
    po_dispatch_date: dt.date | None,
    dispatch_date: dt.date | None,
    *,
    today: dt.date | None = None,
) -> ProjectStatus:
    """Derive on-time status from dates rather than trusting a stored flag,
    which otherwise goes stale the moment the imported snapshot ages past its
    deadline. Production (dispatch vs. its target) takes precedence over R&D
    (end date) since a project with both sets of fields populated is further
    along its Production leg.
    """
    today = today or dt.date.today()

    if dispatch_date is not None:
        if po_dispatch_date is not None and dispatch_date > po_dispatch_date:
            return "at_risk"
        return "on_time"
    if po_dispatch_date is not None:
        return "at_risk" if today > po_dispatch_date else "on_time"
    if end_date is not None:
        return "at_risk" if today > end_date else "on_time"
    return "no_data"


class Base(DeclarativeBase):
    pass


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    project_code: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)

    target_molecule: Mapped[str | None] = mapped_column(String, nullable=True)

    # R&D sheet fields
    team_lead: Mapped[str | None] = mapped_column(String, nullable=True)
    quantity: Mapped[str | None] = mapped_column(String, nullable=True)
    start_date: Mapped[dt.date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[dt.date | None] = mapped_column(Date, nullable=True)
    on_time: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Production sheet fields
    old_or_new: Mapped[str | None] = mapped_column(String, nullable=True)
    cas_no: Mapped[str | None] = mapped_column(String, nullable=True)
    production_quantity_kg: Mapped[str | None] = mapped_column(String, nullable=True)
    po_date: Mapped[dt.date | None] = mapped_column(Date, nullable=True)
    po_dispatch_date: Mapped[dt.date | None] = mapped_column(Date, nullable=True)
    dispatch_date: Mapped[dt.date | None] = mapped_column(Date, nullable=True)
    delay_reason: Mapped[str | None] = mapped_column(String, nullable=True)

    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow)
    updated_at: Mapped[dt.datetime] = mapped_column(
        DateTime, default=dt.datetime.utcnow, onupdate=dt.datetime.utcnow
    )

    history: Mapped[list["ProjectHistory"]] = relationship(
        back_populates="project", cascade="all, delete-orphan", order_by="ProjectHistory.recorded_at.desc()"
    )


class ProjectHistory(Base):
    __tablename__ = "project_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), nullable=False)
    source: Mapped[str] = mapped_column(String, nullable=False)  # "excel_import" | "manual_edit"
    source_file: Mapped[str | None] = mapped_column(String, nullable=True)
    changed_fields: Mapped[dict] = mapped_column(JSON, default=dict)
    snapshot: Mapped[dict] = mapped_column(JSON, default=dict)
    recorded_at: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow)

    project: Mapped[Project] = relationship(back_populates="history")


class IngestionRun(Base):
    __tablename__ = "ingestion_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    filename: Mapped[str] = mapped_column(String, nullable=False)
    sheet_names_found: Mapped[list] = mapped_column(JSON, default=list)
    rows_processed: Mapped[int] = mapped_column(Integer, default=0)
    rows_created: Mapped[int] = mapped_column(Integer, default=0)
    rows_updated: Mapped[int] = mapped_column(Integer, default=0)
    rows_unchanged: Mapped[int] = mapped_column(Integer, default=0)
    rows_skipped_errors: Mapped[int] = mapped_column(Integer, default=0)
    started_at: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow)
    finished_at: Mapped[dt.datetime | None] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String, default="running")


# --- Pydantic schemas (API layer) -------------------------------------------------


class ProjectRead(BaseModel):
    id: int
    project_code: str
    target_molecule: str | None = None
    team_lead: str | None = None
    quantity: str | None = None
    start_date: dt.date | None = None
    end_date: dt.date | None = None
    on_time: bool | None = None
    remarks: str | None = None
    old_or_new: str | None = None
    cas_no: str | None = None
    production_quantity_kg: str | None = None
    po_date: dt.date | None = None
    po_dispatch_date: dt.date | None = None
    dispatch_date: dt.date | None = None
    delay_reason: str | None = None
    updated_at: dt.datetime

    model_config = {"from_attributes": True}

    @computed_field  # type: ignore[prop-decorator]
    @property
    def status(self) -> ProjectStatus:
        return compute_status(self.end_date, self.po_dispatch_date, self.dispatch_date)


class ProjectUpdate(BaseModel):
    target_molecule: str | None = None
    team_lead: str | None = None
    quantity: str | None = None
    start_date: dt.date | None = None
    end_date: dt.date | None = None
    on_time: bool | None = None
    remarks: str | None = None
    old_or_new: str | None = None
    cas_no: str | None = None
    production_quantity_kg: str | None = None
    po_date: dt.date | None = None
    po_dispatch_date: dt.date | None = None
    dispatch_date: dt.date | None = None
    delay_reason: str | None = None


class ProjectCreate(BaseModel):
    project_code: str
    target_molecule: str | None = None
    team_lead: str | None = None
    # R&D fields
    quantity: str | None = None
    start_date: dt.date | None = None
    end_date: dt.date | None = None
    # Production fields
    old_or_new: str | None = None
    cas_no: str | None = None
    production_quantity_kg: str | None = None
    po_date: dt.date | None = None
    po_dispatch_date: dt.date | None = None


class ProjectHistoryRead(BaseModel):
    id: int
    source: str
    source_file: str | None = None
    changed_fields: dict
    recorded_at: dt.datetime

    model_config = {"from_attributes": True}


class IngestionResult(BaseModel):
    filename: str
    sheet_names_found: list[str]
    rows_processed: int
    rows_created: int
    rows_updated: int
    rows_unchanged: int
    rows_skipped_errors: int
    status: str
