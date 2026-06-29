from __future__ import annotations

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.company import Company
from app.schemas.company import CompanyCreatePayload
from app.services.storage import StorageProvider

COMPANY_COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EC4899", "#06B6D4"]


def _slugify(text: str) -> str:
    slug = "-".join(text.strip().lower().split())
    return "".join(ch for ch in slug if ch.isalnum() or ch == "-") or "company"


def _pick_color(name: str) -> str:
    return COMPANY_COLORS[sum(ord(ch) for ch in name) % len(COMPANY_COLORS)]


def create_company(
    db: Session,
    payload: CompanyCreatePayload,
    logo_file: UploadFile | None,
    storage_provider: StorageProvider,
) -> Company:
    logo_url: str | None = None
    if logo_file and logo_file.filename:
        logo_url = storage_provider.upload_logo(
            file=logo_file,
            company_slug=_slugify(payload.name),
        )

    company = Company(
        name=payload.name,
        company_type=payload.company_type,
        cin=payload.cin,
        gstin=payload.gstin,
        address_line1=payload.address_line1,
        address_line2=payload.address_line2,
        city=payload.city,
        state=payload.state,
        pincode=payload.pincode,
        logo_url=logo_url,
        official_email=payload.official_email,
        official_contact=payload.official_contact,
        official_mobile=payload.official_mobile,
        color=_pick_color(payload.name),
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    return company
