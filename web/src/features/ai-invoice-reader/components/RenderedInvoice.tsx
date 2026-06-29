import type { ParsedInvoice } from '@core/ai-invoice';

interface Props {
  invoice: ParsedInvoice;
}

function fmt(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-sm text-white leading-snug">{value}</p>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-white/[0.06] my-3" />;
}

function AmountRow({
  label,
  amount,
  currency,
  bold,
}: {
  label: string;
  amount: number;
  currency: string;
  bold?: boolean;
}) {
  if (!amount) return null;
  return (
    <div className={`flex items-center justify-between ${bold ? 'pt-1' : ''}`}>
      <span
        className={`text-sm ${bold ? 'font-semibold text-white' : 'text-[#9CA3AF]'}`}
      >
        {label}
      </span>
      <span
        className={`text-sm tabular-nums ${bold ? 'font-bold text-white' : 'text-[#D1D5DB]'}`}
      >
        {fmt(amount, currency)}
      </span>
    </div>
  );
}

export function RenderedInvoice({ invoice }: Props) {
  const cur = invoice.currency || 'INR';

  return (
    <div
      className="rounded-2xl overflow-hidden text-white"
      style={{
        background: 'linear-gradient(145deg, #0F1117 0%, #141420 100%)',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header strip */}
      <div
        className="px-4 py-3 flex items-start justify-between gap-3"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}
      >
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-0.5">
            Tax Invoice
          </p>
          <p className="text-base font-bold text-white truncate">
            {invoice.vendor_name || 'Unknown Vendor'}
          </p>
          {invoice.vendor_gstin && (
            <p className="text-xs text-indigo-200 mt-0.5 font-mono">
              GSTIN: {invoice.vendor_gstin}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          {invoice.invoice_number && (
            <p className="text-xs font-bold text-indigo-200">
              #{invoice.invoice_number}
            </p>
          )}
          {invoice.invoice_date && (
            <p className="text-[11px] text-indigo-300 mt-0.5">{invoice.invoice_date}</p>
          )}
          {invoice.confidence > 0 && (
            <p className="text-[10px] text-indigo-400 mt-1">
              {Math.round(invoice.confidence * 100)}% confidence
            </p>
          )}
        </div>
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* Vendor / Buyer info */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <Field label="Vendor address" value={invoice.vendor_address} />
          <Field label="Buyer" value={invoice.buyer_name} />
          <Field label="Buyer address" value={invoice.buyer_address} />
          {invoice.buyer_gstin && (
            <Field label="Buyer GSTIN" value={invoice.buyer_gstin} />
          )}
        </div>

        {/* Dates / PO */}
        {(invoice.due_date || invoice.po_number) && (
          <>
            <Divider />
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <Field label="Due date" value={invoice.due_date} />
              <Field label="PO number" value={invoice.po_number} />
            </div>
          </>
        )}

        {/* Line items */}
        {invoice.line_items.length > 0 && (
          <>
            <Divider />
            <div>
              <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                Line Items
              </p>
              <div className="space-y-1.5">
                {/* Header row */}
                <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 text-[10px] font-bold text-[#6B7280] uppercase px-2">
                  <span>Description</span>
                  <span className="text-right">Qty</span>
                  <span className="text-right">Amount</span>
                </div>
                {invoice.line_items.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-[1fr_auto_auto] gap-x-3 rounded-lg px-2 py-1.5"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-white font-medium truncate">
                        {item.description}
                      </p>
                      {item.hsn_code && (
                        <p className="text-[10px] text-[#6B7280] font-mono">
                          HSN {item.hsn_code}
                        </p>
                      )}
                      {item.unit_price > 0 && (
                        <p className="text-[10px] text-[#6B7280]">
                          {fmt(item.unit_price, cur)} / {item.unit || 'unit'}
                        </p>
                      )}
                      {(item.tax_percent > 0 || item.tax_amount > 0 || item.discount > 0) && (
                        <p className="text-[10px] text-[#6B7280]">
                          {item.tax_percent > 0 ? `GST ${item.tax_percent}%` : ''}
                          {item.tax_percent > 0 && item.tax_amount > 0 ? ' · ' : ''}
                          {item.tax_amount > 0 ? `Tax ${fmt(item.tax_amount, cur)}` : ''}
                          {(item.tax_percent > 0 || item.tax_amount > 0) && item.discount > 0 ? ' · ' : ''}
                          {item.discount > 0 ? `Disc ${fmt(item.discount, cur)}` : ''}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-[#9CA3AF] tabular-nums self-center">
                      {item.quantity}
                    </span>
                    <span className="text-xs text-[#D1D5DB] tabular-nums font-medium self-center">
                      {fmt(item.total_price, cur)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Totals */}
        {(invoice.gross_total > 0
          || invoice.discount > 0
          || invoice.subtotal > 0
          || invoice.tax > 0
          || invoice.cgst > 0
          || invoice.sgst > 0
          || invoice.igst > 0
          || invoice.cess > 0
          || invoice.rounding !== 0
          || invoice.total > 0) && (
          <>
            <Divider />
            <div className="space-y-1.5 rounded-xl px-3 py-2" style={{ background: 'rgba(99,102,241,0.07)' }}>
              <AmountRow label="Gross Amount" amount={invoice.gross_total} currency={cur} />
              <AmountRow label="Discount" amount={invoice.discount} currency={cur} />
              <AmountRow label="Subtotal" amount={invoice.subtotal} currency={cur} />
              <AmountRow label="Tax / GST" amount={invoice.tax} currency={cur} />
              <AmountRow label="CGST" amount={invoice.cgst} currency={cur} />
              <AmountRow label="SGST" amount={invoice.sgst} currency={cur} />
              <AmountRow label="IGST" amount={invoice.igst} currency={cur} />
              <AmountRow label="CESS" amount={invoice.cess} currency={cur} />
              <AmountRow label="Rounding" amount={invoice.rounding} currency={cur} />
              {invoice.total > 0 && (
                <div className="border-t border-white/[0.08] pt-1.5 mt-1">
                  <AmountRow label="Total" amount={invoice.total} currency={cur} bold />
                </div>
              )}
            </div>
          </>
        )}

        {/* Notes */}
        {invoice.notes && (
          <>
            <Divider />
            <div>
              <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
                Notes
              </p>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">{invoice.notes}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
