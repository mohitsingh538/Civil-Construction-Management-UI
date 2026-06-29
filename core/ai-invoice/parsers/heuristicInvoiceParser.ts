import type { ParsedInvoice, InvoiceLineItem } from '../types';

const DATE_RE =
  /\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2})\b/g;
const INVOICE_NO_RE = /\b(?:invoice|inv|bill)\s*(?:no|#|number)?[:\s]*([A-Z0-9\-\/]+)/i;
const CURRENCY_RE = /(₹|INR|USD|\$|EUR|€)/i;
const AMOUNT_RE = /(?:total|amount|grand\s*total|balance\s*due)[:\s]*[₹$€]?\s*([\d,]+\.?\d*)/gi;

function parseAmount(raw: string): number {
  const n = parseFloat(raw.replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function pickDates(text: string): { invoice_date: string; due_date: string } {
  const matches = [...text.matchAll(DATE_RE)].map((m) => m[1]);
  return {
    invoice_date: matches[0] ?? '',
    due_date: matches[1] ?? '',
  };
}

function extractLineItems(text: string): InvoiceLineItem[] {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const items: InvoiceLineItem[] = [];
  for (const line of lines) {
    const m = line.match(
      /^(.+?)\s+(\d+(?:\.\d+)?)\s+[x×]\s+[₹$]?\s*([\d,]+\.?\d*)\s*=\s*[₹$]?\s*([\d,]+\.?\d*)/i,
    );
    if (m) {
      items.push({
        description: m[1].trim(),
        hsn_code: '',
        quantity: parseFloat(m[2]),
        unit: '',
        unit_price: parseAmount(m[3]),
        taxable_value: parseAmount(m[4]),
        tax_percent: 0,
        tax_amount: 0,
        discount: 0,
        discount_percent: 0,
        total_price: parseAmount(m[4]),
      });
    }
  }
  return items;
}

/**
 * Lightweight fallback parser — used only when Gemini is unavailable.
 */
export function heuristicParseInvoice(rawText: string): ParsedInvoice {
  const text = rawText.trim();
  const dates = pickDates(text);
  const invMatch = text.match(INVOICE_NO_RE);
  const currencyMatch = text.match(CURRENCY_RE);
  let total = 0;
  let subtotal = 0;
  let tax = 0;
  for (const m of text.matchAll(AMOUNT_RE)) {
    const val = parseAmount(m[1]);
    const label = m[0].toLowerCase();
    if (label.includes('tax') || label.includes('gst')) tax = val;
    else if (label.includes('sub')) subtotal = val;
    else total = Math.max(total, val);
  }

  const firstLine = text.split('\n').find((l) => l.trim().length > 2) ?? '';

  return {
    vendor_name: firstLine.slice(0, 80),
    vendor_address: '',
    vendor_gstin: '',
    buyer_name: '',
    buyer_address: '',
    buyer_gstin: '',
    invoice_number: invMatch?.[1] ?? '',
    invoice_date: dates.invoice_date,
    due_date: dates.due_date,
    po_number: '',
    currency: currencyMatch?.[1]?.replace('₹', 'INR') ?? 'INR',
    gross_total: 0,
    discount: 0,
    subtotal,
    cgst: 0,
    sgst: 0,
    igst: 0,
    cess: 0,
    tax,
    rounding: 0,
    total,
    line_items: extractLineItems(text),
    notes: '',
    confidence: 0.55,
  };
}

export function emptyParsedInvoice(): ParsedInvoice {
  return {
    vendor_name: '',
    vendor_address: '',
    vendor_gstin: '',
    buyer_name: '',
    buyer_address: '',
    buyer_gstin: '',
    invoice_number: '',
    invoice_date: '',
    due_date: '',
    po_number: '',
    currency: 'INR',
    gross_total: 0,
    discount: 0,
    subtotal: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    cess: 0,
    tax: 0,
    rounding: 0,
    total: 0,
    line_items: [],
    notes: '',
    confidence: 0,
  };
}
