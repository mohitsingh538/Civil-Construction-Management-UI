from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends, Request, UploadFile
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.company import CompanyCreatePayload, CompanyResponse
from app.services.company_service import create_company
from app.services.storage import StorageProvider, get_storage_provider

router = APIRouter(prefix="/api/v1/companies", tags=["companies"])


def _pick(primary: str | None, fallback: str | None) -> str | None:
    if primary is not None:
        return primary
    return fallback


def _as_optional_str(raw: Any) -> str | None:
    if raw is None:
        return None
    if isinstance(raw, UploadFile):
        return None
    text = str(raw).strip()
    return text if text else None


@router.post("", status_code=201)
async def add_company(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    storage_provider: Annotated[StorageProvider, Depends(get_storage_provider)],
) -> CompanyResponse:
    form = await request.form()

    logo_obj = form.get("logo")
    logo: UploadFile | None = logo_obj if isinstance(logo_obj, UploadFile) else None

    payload_data = {
        "name": _as_optional_str(form.get("name")) or "",
        "company_type": _pick(
            _as_optional_str(form.get("company_type")),
            _as_optional_str(form.get("companyType")),
        )
        or "",
        "cin": _as_optional_str(form.get("cin")),
        "gstin": _as_optional_str(form.get("gstin")),
        "address_line1": _pick(
            _as_optional_str(form.get("address_line1")),
            _as_optional_str(form.get("addressLine1")),
        ),
        "address_line2": _pick(
            _as_optional_str(form.get("address_line2")),
            _as_optional_str(form.get("addressLine2")),
        ),
        "city": _as_optional_str(form.get("city")) or "",
        "state": _as_optional_str(form.get("state")) or "",
        "pincode": _as_optional_str(form.get("pincode")) or "",
        "official_email": _pick(
            _as_optional_str(form.get("official_email")),
            _as_optional_str(form.get("officialEmail")),
        ),
        "official_contact": _pick(
            _as_optional_str(form.get("official_contact")),
            _as_optional_str(form.get("officialContact")),
        ),
        "official_mobile": _pick(
            _as_optional_str(form.get("official_mobile")),
            _as_optional_str(form.get("officialMobile")),
        ),
    }

    payload = CompanyCreatePayload.model_validate(payload_data)

    company = create_company(
        db=db,
        payload=payload,
        logo_file=logo,
        storage_provider=storage_provider,
    )
    return CompanyResponse(
        id=company.id,
        name=company.name,
        company_type=company.company_type,
        cin=company.cin,
        gstin=company.gstin,
        address_line1=company.address_line1,
        address_line2=company.address_line2,
        city=company.city,
        state=company.state,
        pincode=company.pincode,
        logo_url=company.logo_url,
        official_email=company.official_email,
        official_contact=company.official_contact,
        official_mobile=company.official_mobile,
        sites=company.sites,
        employees=company.employees,
        color=company.color,
        location=f"{company.city}, {company.state}",
        created_at=company.created_at,
        updated_at=company.updated_at,
    )
