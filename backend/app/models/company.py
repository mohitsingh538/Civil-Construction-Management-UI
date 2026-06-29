from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    company_type: Mapped[str] = mapped_column(String(64), nullable=False)
    cin: Mapped[str | None] = mapped_column(String(21), nullable=True)
    gstin: Mapped[str | None] = mapped_column(String(15), nullable=True)
    address_line1: Mapped[str | None] = mapped_column(String(255), nullable=True)
    address_line2: Mapped[str | None] = mapped_column(String(255), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    pincode: Mapped[str] = mapped_column(String(6), nullable=False)

    logo_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)

    official_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    official_contact: Mapped[str | None] = mapped_column(String(30), nullable=True)
    official_mobile: Mapped[str | None] = mapped_column(String(20), nullable=True)

    # UI summary fields used by existing frontend company cards.
    sites: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    employees: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    color: Mapped[str] = mapped_column(String(16), nullable=False, default="#3B82F6", server_default="#3B82F6")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
