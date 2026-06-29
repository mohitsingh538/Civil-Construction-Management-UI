from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class CompanyCreatePayload(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    company_type: str = Field(min_length=1, max_length=64)
    cin: str | None = Field(default=None, max_length=21)
    gstin: str | None = Field(default=None, max_length=15)
    address_line1: str | None = Field(default=None, max_length=255)
    address_line2: str | None = Field(default=None, max_length=255)
    city: str = Field(min_length=1, max_length=100)
    state: str = Field(min_length=1, max_length=100)
    pincode: str = Field(min_length=6, max_length=6)
    official_email: str | None = Field(default=None, max_length=255)
    official_contact: str | None = Field(default=None, max_length=30)
    official_mobile: str | None = Field(default=None, max_length=20)

    @field_validator("name", "company_type", "city", "state", mode="before")
    @classmethod
    def _strip_required(cls, value: str) -> str:
        return value.strip() if isinstance(value, str) else value

    @field_validator(
        "cin",
        "gstin",
        "address_line1",
        "address_line2",
        "official_email",
        "official_contact",
        "official_mobile",
        mode="before",
    )
    @classmethod
    def _normalize_optional(cls, value: str | None) -> str | None:
        if value is None:
            return None
        stripped = value.strip()
        return stripped if stripped else None

    @field_validator("pincode", mode="before")
    @classmethod
    def _normalize_pincode(cls, value: str) -> str:
        if not isinstance(value, str):
            return value
        digits = "".join(ch for ch in value if ch.isdigit())
        return digits


class CompanyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    company_type: str
    cin: str | None
    gstin: str | None
    address_line1: str | None
    address_line2: str | None
    city: str
    state: str
    pincode: str
    logo_url: str | None
    official_email: str | None
    official_contact: str | None
    official_mobile: str | None
    sites: int
    employees: int
    color: str
    location: str
    created_at: datetime
    updated_at: datetime
