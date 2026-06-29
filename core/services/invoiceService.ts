import type { InvoiceLineItem } from '../types';

/** Gross amount before discount and GST. */
export function getLineGross(item: InvoiceLineItem): number {
  return item.qty * item.rate;
}

/** Discount amount in rupees. */
export function getLineDiscountAmount(item: InvoiceLineItem): number {
  const gross = getLineGross(item);
  if (item.discountType === 'flat') return Math.min(item.discount ?? 0, gross);
  return (gross * (item.discount ?? 0)) / 100;
}

/** Taxable value: gross minus discount, before GST. */
export function getLineTaxableValue(item: InvoiceLineItem): number {
  return Math.max(0, getLineGross(item) - getLineDiscountAmount(item));
}

/** GST rupee amount for a line item. */
export function getLineGSTAmount(item: InvoiceLineItem): number {
  return (getLineTaxableValue(item) * item.gst) / 100;
}

/** Total for a single line item (taxable value + GST). */
export function calculateLineTotal(item: InvoiceLineItem): number {
  return getLineTaxableValue(item) + getLineGSTAmount(item);
}

/** Sum of taxable values (after discount, before GST) across all line items. */
export function calculateInvoiceSubtotal(lineItems: InvoiceLineItem[]): number {
  return lineItems.reduce((sum, item) => sum + getLineTaxableValue(item), 0);
}

/** Total GST amount across all line items. */
export function calculateInvoiceGST(lineItems: InvoiceLineItem[]): number {
  return lineItems.reduce((sum, item) => sum + getLineGSTAmount(item), 0);
}

/** Grand total (subtotal + GST). */
export function calculateInvoiceTotal(lineItems: InvoiceLineItem[]): number {
  return calculateInvoiceSubtotal(lineItems) + calculateInvoiceGST(lineItems);
}
