"""
Invoice Reader endpoint — powered by pymupdf4llm + Google Gemini.

POST /api/v1/invoice-reader
  Accepts: multipart/form-data  { file: <pdf or image> }

Returns: { invoice, markdown_length, inference_ms, provider }
"""

from __future__ import annotations

import json
import logging
import os
import re
import tempfile
import time
from typing import Any

import pymupdf4llm
from fastapi import APIRouter, File, HTTPException, UploadFile
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["invoice-reader"])

# ---------------------------------------------------------------------------
# Gemini client — initialised lazily so the server starts even without a key
# ---------------------------------------------------------------------------
_gemini: "genai.Client | None" = None


def _get_gemini() -> "genai.Client":
    global _gemini
    if _gemini is None:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=503,
                detail="GEMINI_API_KEY environment variable is not set",
            )
        _gemini = genai.Client(api_key=api_key)
    return _gemini


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------


class InvoiceLineItem(BaseModel):
    description: str = ""
    hsn_code: str = ""
    quantity: float = 0.0
    unit: str = ""
    unit_price: float = 0.0
    taxable_value: float = 0.0
    tax_percent: float = 0.0
    tax_amount: float = 0.0
    discount: float = 0.0
    discount_percent: float = 0.0
    total_price: float = 0.0


class ParsedInvoice(BaseModel):
    vendor_name: str = ""
    vendor_address: str = ""
    vendor_gstin: str = ""
    buyer_name: str = ""
    buyer_address: str = ""
    buyer_gstin: str = ""
    invoice_number: str = ""
    invoice_date: str = ""
    due_date: str = ""
    po_number: str = ""
    currency: str = "INR"
    gross_total: float = 0.0
    discount: float = 0.0
    subtotal: float = 0.0
    cgst: float = 0.0
    sgst: float = 0.0
    igst: float = 0.0
    cess: float = 0.0
    tax: float = 0.0
    rounding: float = 0.0
    total: float = 0.0
    line_items: list[InvoiceLineItem] = Field(default_factory=list)
    notes: str = ""
    confidence: float = 0.9


class InvoiceReaderResponse(BaseModel):
    invoice: ParsedInvoice
    markdown_length: int
    inference_ms: int
    provider: str = "Gemini"


# ---------------------------------------------------------------------------
# PDF / image to markdown via pymupdf4llm
# ---------------------------------------------------------------------------

_SUPPORTED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/bmp",
    "image/tiff",
}
_SUPPORTED_PDF_TYPE = "application/pdf"


def _to_markdown(file_bytes: bytes, content_type: str) -> str:
    """Convert uploaded file bytes to markdown text using pymupdf4llm."""
    suffix = ".pdf" if content_type == _SUPPORTED_PDF_TYPE else ".img"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name
    try:
        md: str = pymupdf4llm.to_markdown(tmp_path)
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass
    return md


# ---------------------------------------------------------------------------
# Gemini structured extraction
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = """\
You are an expert invoice data extraction assistant.
You will receive the text content of an invoice (in Markdown format) and must
extract all available fields accurately.

Rules:
- Use 0.0 for numeric fields that are absent.
- Use empty string "" for string fields that are absent.
- Prefer explicit tax breakup values (CGST/SGST/IGST/CESS) when present.
- confidence should reflect how complete and legible the invoice data is.
"""


def _to_float(value: Any) -> float:
    if value is None:
        return 0.0
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        cleaned = re.sub(r"[^\d.\-]", "", value)
        if not cleaned or cleaned in {"-", ".", "-."}:
            return 0.0
        try:
            return float(cleaned)
        except ValueError:
            return 0.0
    return 0.0


def _to_str(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _pick(data: dict[str, Any], *keys: str, default: Any = None) -> Any:
    for key in keys:
        if key in data and data[key] is not None:
            return data[key]
    return default


def _normalize_line_item(raw_item: Any) -> dict[str, Any]:
    if not isinstance(raw_item, dict):
        return InvoiceLineItem().model_dump()

    taxable_value = _to_float(
        _pick(raw_item, "taxable_value", "taxable", "amount_before_tax", default=0.0)
    )
    total_price = _to_float(_pick(raw_item, "total_price", "total", "amount", default=0.0))
    unit_price = _to_float(_pick(raw_item, "unit_price", "rate", "price", default=0.0))
    quantity = _to_float(_pick(raw_item, "quantity", "qty", default=0.0))

    if taxable_value <= 0 and quantity > 0 and unit_price > 0:
        taxable_value = quantity * unit_price

    return {
        "description": _to_str(_pick(raw_item, "description", "name", "item", default="")),
        "hsn_code": _to_str(_pick(raw_item, "hsn_code", "hsn_sac", "hsn", "sac", default="")),
        "quantity": quantity,
        "unit": _to_str(_pick(raw_item, "unit", "uom", default="")),
        "unit_price": unit_price,
        "taxable_value": taxable_value,
        "tax_percent": _to_float(_pick(raw_item, "tax_percent", "gst_percent", "gst", default=0.0)),
        "tax_amount": _to_float(_pick(raw_item, "tax_amount", "gst_amount", default=0.0)),
        "discount": _to_float(_pick(raw_item, "discount", "discount_amount", default=0.0)),
        "discount_percent": _to_float(_pick(raw_item, "discount_percent", default=0.0)),
        "total_price": total_price,
    }


def _normalize_invoice_dict(raw: dict[str, Any]) -> dict[str, Any]:
    totals = raw.get("totals") if isinstance(raw.get("totals"), dict) else {}

    line_items_raw = _pick(raw, "line_items", "items", "products", default=[])
    if not isinstance(line_items_raw, list):
        line_items_raw = []
    line_items = [_normalize_line_item(item) for item in line_items_raw]

    subtotal = _to_float(_pick(raw, "subtotal", default=None))
    if subtotal <= 0:
        subtotal = _to_float(
            _pick(
                totals,
                "subtotal",
                "taxable_amount",
                "taxable_value",
                "amount_before_tax",
                default=0.0,
            )
        )

    cgst = _to_float(_pick(raw, "cgst", default=None))
    if cgst <= 0:
        cgst = _to_float(_pick(totals, "cgst", default=0.0))

    sgst = _to_float(_pick(raw, "sgst", default=None))
    if sgst <= 0:
        sgst = _to_float(_pick(totals, "sgst", default=0.0))

    igst = _to_float(_pick(raw, "igst", default=None))
    if igst <= 0:
        igst = _to_float(_pick(totals, "igst", default=0.0))

    cess = _to_float(_pick(raw, "cess", default=None))
    if cess <= 0:
        cess = _to_float(_pick(totals, "cess", default=0.0))

    discount = _to_float(_pick(raw, "discount", default=None))
    if discount <= 0:
        discount = _to_float(_pick(totals, "discount", "discount_amount", default=0.0))

    gross_total = _to_float(_pick(raw, "gross_total", default=None))
    if gross_total <= 0:
        gross_total = _to_float(
            _pick(totals, "gross_total", "gross_amount", "amount_before_discount", default=0.0)
        )
    if gross_total <= 0 and subtotal > 0 and discount > 0:
        gross_total = subtotal + discount

    tax = _to_float(_pick(raw, "tax", default=None))
    if tax <= 0:
        tax = _to_float(_pick(totals, "tax", "total_tax", default=0.0))
    if tax <= 0:
        tax = cgst + sgst + igst + cess

    total = _to_float(_pick(raw, "total", default=None))
    if total <= 0:
        total = _to_float(_pick(totals, "total", "grand_total", "net_total", default=0.0))

    currency = _to_str(_pick(raw, "currency", default=""))
    if not currency:
        currency = _to_str(_pick(totals, "currency", default="INR")) or "INR"

    return {
        "vendor_name": _to_str(_pick(raw, "vendor_name", "supplier_name", "seller_name", default="")),
        "vendor_address": _to_str(
            _pick(raw, "vendor_address", "supplier_address", "seller_address", default="")
        ),
        "vendor_gstin": _to_str(_pick(raw, "vendor_gstin", "supplier_gstin", "seller_gstin", default="")),
        "buyer_name": _to_str(_pick(raw, "buyer_name", "customer_name", default="")),
        "buyer_address": _to_str(_pick(raw, "buyer_address", "customer_address", default="")),
        "buyer_gstin": _to_str(_pick(raw, "buyer_gstin", "customer_gstin", default="")),
        "invoice_number": _to_str(_pick(raw, "invoice_number", "invoice_no", "bill_no", default="")),
        "invoice_date": _to_str(_pick(raw, "invoice_date", "date", default="")),
        "due_date": _to_str(_pick(raw, "due_date", default="")),
        "po_number": _to_str(_pick(raw, "po_number", "purchase_order_number", default="")),
        "currency": currency,
        "gross_total": gross_total,
        "discount": discount,
        "subtotal": subtotal,
        "cgst": cgst,
        "sgst": sgst,
        "igst": igst,
        "cess": cess,
        "tax": tax,
        "rounding": _to_float(_pick(raw, "rounding", default=None))
        or _to_float(_pick(totals, "rounding", "round_off", default=0.0)),
        "total": total,
        "line_items": line_items,
        "notes": _to_str(_pick(raw, "notes", "remarks", default="")),
        "confidence": _to_float(_pick(raw, "confidence", default=0.9)),
    }


def _round_money(value: float) -> float:
    return round(float(value), 2)


def _reconcile_number(existing: float, computed: float, tolerance: float = 1.0) -> float:
    """Keep existing value if close enough, otherwise replace with computed."""
    if existing <= 0:
        return computed
    if abs(existing - computed) > tolerance:
        return computed
    return existing


def _verify_and_reconcile_invoice_dict(invoice: dict[str, Any]) -> dict[str, Any]:
    """Verify arithmetic and reconcile line + summary totals on parsed invoice data."""
    line_items = invoice.get("line_items") if isinstance(invoice.get("line_items"), list) else []

    verified_items: list[dict[str, Any]] = []
    gross_sum = 0.0
    discount_sum = 0.0
    subtotal_sum = 0.0
    tax_sum = 0.0
    total_sum = 0.0

    for raw_item in line_items:
        item = _normalize_line_item(raw_item)

        quantity = max(0.0, _to_float(item.get("quantity")))
        unit_price = max(0.0, _to_float(item.get("unit_price")))
        gross = quantity * unit_price

        discount = max(0.0, _to_float(item.get("discount")))
        discount_percent = max(0.0, _to_float(item.get("discount_percent")))
        if discount <= 0 and discount_percent > 0 and gross > 0:
            discount = gross * (discount_percent / 100.0)
        if discount_percent <= 0 and discount > 0 and gross > 0:
            discount_percent = (discount / gross) * 100.0

        taxable_computed = max(0.0, gross - discount)
        taxable_existing = max(0.0, _to_float(item.get("taxable_value")))
        taxable_value = _reconcile_number(taxable_existing, taxable_computed)

        tax_percent = max(0.0, _to_float(item.get("tax_percent")))
        tax_amount_computed = taxable_value * (tax_percent / 100.0)
        tax_amount_existing = max(0.0, _to_float(item.get("tax_amount")))
        tax_amount = _reconcile_number(tax_amount_existing, tax_amount_computed)

        total_price_computed = taxable_value + tax_amount
        total_price_existing = max(0.0, _to_float(item.get("total_price")))
        total_price = _reconcile_number(total_price_existing, total_price_computed)

        item["discount"] = _round_money(discount)
        item["discount_percent"] = _round_money(discount_percent)
        item["taxable_value"] = _round_money(taxable_value)
        item["tax_amount"] = _round_money(tax_amount)
        item["total_price"] = _round_money(total_price)

        gross_sum += gross
        discount_sum += discount
        subtotal_sum += taxable_value
        tax_sum += tax_amount
        total_sum += total_price
        verified_items.append(item)

    invoice["line_items"] = verified_items

    gross_total_computed = _round_money(gross_sum)
    discount_computed = _round_money(discount_sum)
    subtotal_computed = _round_money(subtotal_sum)
    tax_computed = _round_money(tax_sum)

    component_tax = (
        _to_float(invoice.get("cgst"))
        + _to_float(invoice.get("sgst"))
        + _to_float(invoice.get("igst"))
        + _to_float(invoice.get("cess"))
    )
    if component_tax > 0:
        tax_computed = _round_money(component_tax)

    rounding_value = _to_float(invoice.get("rounding"))
    total_computed = _round_money(total_sum if total_sum > 0 else subtotal_computed + tax_computed + rounding_value)

    invoice["gross_total"] = _round_money(
        _reconcile_number(_to_float(invoice.get("gross_total")), gross_total_computed)
    )
    invoice["discount"] = _round_money(
        _reconcile_number(_to_float(invoice.get("discount")), discount_computed)
    )
    invoice["subtotal"] = _round_money(
        _reconcile_number(_to_float(invoice.get("subtotal")), subtotal_computed)
    )
    invoice["tax"] = _round_money(_reconcile_number(_to_float(invoice.get("tax")), tax_computed))
    invoice["total"] = _round_money(_reconcile_number(_to_float(invoice.get("total")), total_computed))

    if verified_items:
        notes = _to_str(invoice.get("notes"))
        verification_note = "Amounts verified and reconciled on server"
        if verification_note not in notes:
            invoice["notes"] = f"{notes}\n{verification_note}".strip()

    return invoice


def _call_gemini(md_text: str) -> dict:
    """Send markdown to Gemini and return the structured invoice dict."""
    client = _get_gemini()
    prompt = f"{_SYSTEM_PROMPT}\n\n---\nINVOICE CONTENT:\n{md_text}"

    response = client.models.generate_content(
        model="gemma-4-31b-it",
        contents=[
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=prompt)],
            )
        ],
        config=types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_level="MINIMAL"),
            response_mime_type="application/json",
            response_schema=ParsedInvoice,
        ),
    )

    raw_invoice: dict[str, Any]
    parsed = getattr(response, "parsed", None)
    if isinstance(parsed, BaseModel):
        raw_invoice = parsed.model_dump()
    elif isinstance(parsed, dict):
        raw_invoice = parsed
    else:
        raw_text = (response.text or "").strip() if hasattr(response, "text") else ""
        if not raw_text:
            logger.error("Gemini structured parse failed: empty response")
            raise HTTPException(
                status_code=502,
                detail="Gemini returned empty structured response",
            )
        try:
            raw_invoice = json.loads(raw_text)
        except json.JSONDecodeError as exc:
            logger.error("Gemini raw response text: %s", raw_text[:4000])
            raise HTTPException(
                status_code=502,
                detail=f"Gemini structured output validation failed: {exc}",
            ) from exc

    normalized = _normalize_invoice_dict(raw_invoice)
    return _verify_and_reconcile_invoice_dict(normalized)


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------


@router.post("/invoice-reader", response_model=InvoiceReaderResponse)
async def read_invoice(file: UploadFile = File(...)):
    """
    Accept a PDF or image upload, extract text with pymupdf4llm, and return
    structured invoice data from Gemini.
    """
    content_type = (file.content_type or "").lower()

    if content_type != _SUPPORTED_PDF_TYPE and content_type not in _SUPPORTED_IMAGE_TYPES:
        raise HTTPException(
            status_code=415,
            detail=(
                f"Unsupported file type '{content_type}'. "
                "Accepted: PDF, JPEG, PNG, WebP, BMP, TIFF."
            ),
        )

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        md_text = _to_markdown(raw, content_type)
    except Exception as exc:
        logger.exception("pymupdf4llm conversion failed")
        raise HTTPException(
            status_code=422, detail=f"Could not read file: {exc}"
        ) from exc

    if not md_text.strip():
        raise HTTPException(
            status_code=422,
            detail=(
                "No text could be extracted from the file. "
                "Ensure the PDF is not a purely scanned image without OCR layer."
            ),
        )

    t0 = time.time()
    try:
        invoice_dict = _call_gemini(md_text)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Gemini extraction failed")
        raise HTTPException(status_code=502, detail=f"Gemini API error: {exc}") from exc
    inference_ms = int((time.time() - t0) * 1000)

    try:
        invoice = ParsedInvoice(**invoice_dict)
    except Exception:
        safe = {k: invoice_dict.get(k, v) for k, v in ParsedInvoice().model_dump().items()}
        invoice = ParsedInvoice(**safe)

    return InvoiceReaderResponse(
        invoice=invoice,
        markdown_length=len(md_text),
        inference_ms=inference_ms,
        provider="Gemini",
    )
