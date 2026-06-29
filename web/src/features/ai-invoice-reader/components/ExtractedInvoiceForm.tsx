import type { ParsedInvoice } from '@core/ai-invoice';
import AnimatedPressable from '@/app/components/ui/AnimatedPressable';

interface Props {
  invoice: ParsedInvoice;
  onChange: <K extends keyof ParsedInvoice>(key: K, value: ParsedInvoice[K]) => void;
}

const fieldClass =
  'w-full px-3 py-2 bg-[#0F1117] rounded-lg text-sm text-white placeholder:text-[#6B7280] focus:outline-none';

export function ExtractedInvoiceForm({ invoice, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">Extracted fields</h4>
        <span className="text-xs text-[#6B7280]">
          Confidence {Math.round(invoice.confidence * 100)}%
        </span>
      </div>

      {(
        [
          ['vendor_name', 'Vendor'],
          ['invoice_number', 'Invoice #'],
          ['invoice_date', 'Invoice date'],
          ['due_date', 'Due date'],
          ['currency', 'Currency'],
        ] as const
      ).map(([key, label]) => (
        <div key={key}>
          <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1 block">
            {label}
          </label>
          <input
            className={fieldClass}
            style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)' }}
            value={String(invoice[key] ?? '')}
            onChange={(e) => onChange(key, e.target.value)}
          />
        </div>
      ))}

      <div className="grid grid-cols-3 gap-2">
        {(
          [
            'gross_total',
            'discount',
            'subtotal',
            'cgst',
            'sgst',
            'igst',
            'cess',
            'tax',
            'rounding',
            'total',
          ] as const
        ).map((key) => (
          <div key={key}>
            <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1 block">
              {key}
            </label>
            <input
              type="number"
              className={fieldClass}
              style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)' }}
              value={invoice[key]}
              onChange={(e) => onChange(key, Number.parseFloat(e.target.value) || 0)}
            />
          </div>
        ))}
      </div>

      {invoice.line_items.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-xs text-[#9CA3AF] font-semibold">Line items</p>
          {invoice.line_items.map((item, idx) => (
            <div
              key={idx}
              className="p-2 rounded-lg bg-[#0F1117] text-xs text-[#9CA3AF]"
              style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.35)' }}
            >
              <div className="text-white font-medium truncate">{item.description}</div>
              <div className="flex justify-between mt-1">
                <span>Qty {item.quantity}</span>
                <span>₹{item.total_price.toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ApplyBarProps {
  onApply: () => void;
  onRetry: () => void;
  disabled?: boolean;
}

export function ExtractedInvoiceActions({ onApply, onRetry, disabled }: ApplyBarProps) {
  return (
    <div className="flex gap-2 pt-2">
      <AnimatedPressable
        type="button"
        onClick={onRetry}
        className="flex-1 px-3 py-2 bg-[#141420] rounded-xl text-[#9CA3AF] text-sm font-medium"
      >
        Retry
      </AnimatedPressable>
      <AnimatedPressable
        type="button"
        onClick={onApply}
        disabled={disabled}
        className="flex-1 px-3 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-50"
        style={{
          background: 'linear-gradient(135deg, #6366F1, #818CF8)',
          boxShadow: '0 6px 18px rgba(99,102,241,0.35)',
        }}
      >
        Apply to form
      </AnimatedPressable>
    </div>
  );
}
