import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, FileSpreadsheet, Plus, Download, Eye, Trash2, CheckCircle2, FileText } from 'lucide-react';
import BottomNavbar from './BottomNavbar';
import Modal from './Modal';
import AnimatedPressable from './ui/AnimatedPressable';
import NeumorphicSelect from './ui/NeumorphicSelect';
import NeumorphicDatePicker from './ui/NeumorphicDatePicker';
import { useInvoices } from '@/hooks';
import { AiInvoiceReaderButton, AiInvoiceReaderFlow, RenderedInvoice } from '@/features/ai-invoice-reader';
import type { ParsedInvoice } from '@core/ai-invoice';

type DiscountType = 'flat' | 'percent';

interface LineItem {
  description: string;
  hsn: string;
  qty: number;
  unit: string;
  rate: number;
  gst: number;
  discount: number;
  discountType: DiscountType;
  taxableValue?: number;
  taxAmount?: number;
  lineTotal?: number;
  fromAi?: boolean;
}

const HSN_CODES = [
  { code: '2523', desc: 'Portland Cement', gst: 28 },
  { code: '6810', desc: 'Cement Boards, Slabs & Articles', gst: 28 },
  { code: '2516', desc: 'Granite, Sandstone & Marble Blocks', gst: 5 },
  { code: '2505', desc: 'Natural Sand & Gravel', gst: 5 },
  { code: '6901', desc: 'Bricks, Blocks & Ceramic Tiles', gst: 5 },
  { code: '6802', desc: 'Worked Stone for Flooring & Cladding', gst: 12 },
  { code: '9406', desc: 'Prefabricated Structures & Buildings', gst: 12 },
  { code: '7213', desc: 'TMT Steel Bars & Rods', gst: 18 },
  { code: '7308', desc: 'Structural Steel Fabrications', gst: 18 },
  { code: '7210', desc: 'Steel Sheets & Plates (Galvanised)', gst: 18 },
  { code: '7318', desc: 'Bolts, Nuts, Screws & Fasteners', gst: 18 },
  { code: '7604', desc: 'Aluminium Profiles & Sections', gst: 18 },
  { code: '7412', desc: 'Copper Pipe Fittings & Connectors', gst: 18 },
  { code: '3917', desc: 'PVC / CPVC Pipes & Fittings', gst: 18 },
  { code: '3924', desc: 'Plastic Sanitary Fittings', gst: 18 },
  { code: '4418', desc: "Wood Builders' Joinery & Carpentry", gst: 18 },
  { code: '2710', desc: 'Bitumen, Asphalt & Tar', gst: 18 },
  { code: '3214', desc: 'Sealants, Waterproofing & Caulking Compounds', gst: 18 },
  { code: '3208', desc: 'Paints, Varnishes & Lacquers', gst: 18 },
  { code: '7019', desc: 'Glass Wool & Mineral Insulation', gst: 18 },
  { code: '6903', desc: 'Refractory Bricks & Blocks', gst: 18 },
  { code: '3824', desc: 'Construction Adhesives & Prepared Binders', gst: 18 },
  { code: '8474', desc: 'Concrete Mixers, Crushers & Batching Machinery', gst: 18 },
  { code: '8425', desc: 'Cranes, Hoists & Lifting Equipment', gst: 18 },
  { code: '8536', desc: 'Electrical Switchgear & Components', gst: 18 },
] as const;

const MONTH_MAP: Record<string, string> = {
  jan: '01',
  feb: '02',
  mar: '03',
  apr: '04',
  may: '05',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  oct: '10',
  nov: '11',
  dec: '12',
};

function normalizeDateForPicker(raw: string): string {
  const value = (raw || '').trim();
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const slashOrDash = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/.exec(value);
  if (slashOrDash) {
    const dd = slashOrDash[1].padStart(2, '0');
    const mm = slashOrDash[2].padStart(2, '0');
    const yy = slashOrDash[3].length === 2 ? `20${slashOrDash[3]}` : slashOrDash[3];
    return `${yy}-${mm}-${dd}`;
  }

  const monthText = /^(\d{1,2})[-\s]([A-Za-z]{3,})[-\s](\d{2,4})$/.exec(value);
  if (monthText) {
    const dd = monthText[1].padStart(2, '0');
    const mm = MONTH_MAP[monthText[2].slice(0, 3).toLowerCase()] || '01';
    const yy = monthText[3].length === 2 ? `20${monthText[3]}` : monthText[3];
    return `${yy}-${mm}-${dd}`;
  }

  const dt = new Date(value);
  if (!Number.isNaN(dt.getTime())) {
    const y = String(dt.getFullYear());
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return '';
}

function calcLine(item: LineItem) {
  const gross = item.qty * item.rate;
  const discAmt = item.discountType === 'flat'
    ? Math.min(item.discount, gross)
    : (gross * item.discount) / 100;
  const computedTaxable = Math.max(0, gross - discAmt);
  const taxable = item.fromAi && typeof item.taxableValue === 'number'
    ? item.taxableValue
    : computedTaxable;
  const computedGstAmt = (taxable * item.gst) / 100;
  const gstAmt = item.fromAi && typeof item.taxAmount === 'number'
    ? item.taxAmount
    : computedGstAmt;
  const computedTotal = taxable + gstAmt;
  const total = item.fromAi && typeof item.lineTotal === 'number'
    ? item.lineTotal
    : computedTotal;
  return { gross, discAmt, taxable, gstAmt, total };
}

const defaultLine = (): LineItem => ({
  description: '', hsn: '', qty: 1, unit: '', rate: 0, gst: 18, discount: 0, discountType: 'percent',
});

export default function InvoiceScreen() {
  const navigate = useNavigate();
  const { data: invoices = [], isLoading, error } = useInvoices();
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [showAiReader, setShowAiReader] = useState(false);
  const [showPreviewSheet, setShowPreviewSheet] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([defaultLine()]);
  const [hsnDropdown, setHsnDropdown] = useState<number | null>(null);
  const [vendorName, setVendorName] = useState('');
  const [vendorAddress, setVendorAddress] = useState('');
  const [vendorGstin, setVendorGstin] = useState('');
  const [clientName, setClientName] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [clientGstin, setClientGstin] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('2026-04-25');
  const [dueDate, setDueDate] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [notes, setNotes] = useState('');
  const [originalInvoiceFileName, setOriginalInvoiceFileName] = useState('');
  const [appliedAiInvoice, setAppliedAiInvoice] = useState<ParsedInvoice | null>(null);

  const handleAiApply = (invoice: ParsedInvoice, fileName: string | null) => {
    // Map Gemini-extracted invoice fields onto the create form
    if (invoice.vendor_name) setVendorName(invoice.vendor_name);
    if (invoice.vendor_address) setVendorAddress(invoice.vendor_address);
    if (invoice.vendor_gstin) setVendorGstin(invoice.vendor_gstin);
    if (invoice.buyer_name) setClientName(invoice.buyer_name);
    else if (invoice.vendor_name) setClientName(invoice.vendor_name);
    if (invoice.buyer_address) setBuyerAddress(invoice.buyer_address);
    if (invoice.buyer_gstin) setClientGstin(invoice.buyer_gstin);
    else if (invoice.vendor_gstin) setClientGstin(invoice.vendor_gstin);
    if (invoice.invoice_number) setInvoiceNumber(invoice.invoice_number);
    if (invoice.invoice_date) setInvoiceDate(normalizeDateForPicker(invoice.invoice_date));
    if (invoice.due_date) setDueDate(normalizeDateForPicker(invoice.due_date));
    if (invoice.po_number) setPoNumber(invoice.po_number);
    if (invoice.currency) setCurrency(invoice.currency);
    if (invoice.notes) setNotes(invoice.notes);
    if (fileName) setOriginalInvoiceFileName(fileName);
    setAppliedAiInvoice(invoice);
    if (invoice.line_items.length > 0) {
      setLineItems(
        invoice.line_items.map((li) => ({
          description: li.description,
          hsn: li.hsn_code ?? '',
          qty: li.quantity || 1,
          unit: li.unit || '',
          rate: li.unit_price || (li.quantity > 0 ? (li.taxable_value || 0) / li.quantity : 0),
          gst: li.tax_percent || 18,
          discount: li.discount_percent > 0 ? li.discount_percent : (li.discount || 0),
          discountType: li.discount_percent > 0 ? 'percent' : 'flat',
          taxableValue: li.taxable_value,
          taxAmount: li.tax_amount,
          lineTotal: li.total_price,
          fromAi: true,
        }))
      );
    }
    setShowCreateInvoice(true);
  };

  if (isLoading) return <div className="min-h-screen bg-[#0F1117] flex items-center justify-center"><span className="text-[#9CA3AF]">Loading...</span></div>;
  if (error) return <div className="min-h-screen bg-[#0F1117] flex items-center justify-center"><span className="text-red-400">Error loading invoices</span></div>;

  const updateLine = (idx: number, field: keyof LineItem, value: any) => {
    setAppliedAiInvoice(null);
    setLineItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      return {
        ...item,
        [field]: value,
        fromAi: false,
        taxableValue: undefined,
        taxAmount: undefined,
        lineTotal: undefined,
      };
    }));
  };

  const addLine = () => {
    setAppliedAiInvoice(null);
    setLineItems(prev => [...prev, defaultLine()]);
  };
  const removeLine = (idx: number) => {
    if (lineItems.length > 1) {
      setAppliedAiInvoice(null);
      setLineItems(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const selectHSN = (idx: number, h: (typeof HSN_CODES)[number]) => {
    setAppliedAiInvoice(null);
    setLineItems(prev => prev.map((item, i) =>
      i === idx
        ? {
            ...item,
            hsn: h.code,
            gst: h.gst,
            fromAi: false,
            taxableValue: undefined,
            taxAmount: undefined,
            lineTotal: undefined,
          }
        : item
    ));
    setHsnDropdown(null);
  };

  const totals = lineItems.reduce(
    (acc, item) => {
      const { gross, discAmt, taxable, gstAmt, total } = calcLine(item);
      return {
        gross: acc.gross + gross,
        discount: acc.discount + discAmt,
        subtotal: acc.subtotal + taxable,
        gst: acc.gst + gstAmt,
        total: acc.total + total,
      };
    },
    { gross: 0, discount: 0, subtotal: 0, gst: 0, total: 0 },
  );

  const displayedTotals = appliedAiInvoice
    ? {
        gross: appliedAiInvoice.gross_total || totals.gross,
        discount: appliedAiInvoice.discount || totals.discount,
        subtotal: appliedAiInvoice.subtotal || totals.subtotal,
        gst: appliedAiInvoice.tax || totals.gst,
        total: appliedAiInvoice.total || totals.total,
        cgst: appliedAiInvoice.cgst,
        sgst: appliedAiInvoice.sgst,
        igst: appliedAiInvoice.igst,
        cess: appliedAiInvoice.cess,
        rounding: appliedAiInvoice.rounding,
      }
    : {
        gross: totals.gross,
        discount: totals.discount,
        subtotal: totals.subtotal,
        gst: totals.gst,
        total: totals.total,
        cgst: 0,
        sgst: 0,
        igst: 0,
        cess: 0,
        rounding: 0,
      };

  const resetCreateForm = () => {
    setAppliedAiInvoice(null);
    setVendorName('');
    setVendorAddress('');
    setVendorGstin('');
    setClientName('');
    setBuyerAddress('');
    setClientGstin('');
    setInvoiceNumber('');
    setInvoiceDate('2026-04-25');
    setDueDate('');
    setPoNumber('');
    setCurrency('INR');
    setNotes('');
    setOriginalInvoiceFileName('');
    setLineItems([defaultLine()]);
  };

  return (
    <div className="h-[var(--app-height)] bg-[#0F1117] flex flex-col">
      {/* Header Bar */}
      <div className="sticky top-0 z-20 bg-[#16161F] border-b border-white/[0.07]"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center gap-4 mb-4">
            <AnimatedPressable
              onClick={() => navigate('/site')}
              className="p-2.5 bg-[#1E1E2E] rounded-xl"
              style={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
              }}>
              <ArrowLeft className="w-5 h-5 text-[#9CA3AF]" />
            </AnimatedPressable>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#141420] rounded-xl flex items-center justify-center"
                style={{
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.2)',
                }}>
                <FileSpreadsheet className="w-6 h-6 text-[#6366F1]" />
              </div>

              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">Invoice & Billing</h1>
                <p className="text-sm text-[#9CA3AF] font-medium">GST Invoices</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <AnimatedPressable
              onClick={() => {
                resetCreateForm();
                setShowCreateInvoice(true);
              }}
              className="px-5 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #6366F1, #818CF8)',
                boxShadow: '0 8px 24px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}>
              <Plus className="w-5 h-5" />
              Create New Invoice
            </AnimatedPressable>
            <AiInvoiceReaderButton onOpenReader={() => setShowAiReader(true)} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain w-full relative z-10 max-w-7xl mx-auto px-6 py-8" style={{ paddingBottom: 'calc(124px + env(safe-area-inset-bottom))' }}>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
          {[
            { label: 'Total Invoices', value: invoices.length, color: '#9CA3AF' },
            { label: 'This Month', value: '₹24.8L', color: '#6366F1' },
            { label: 'Paid', value: '₹10.0L', color: '#10B981' },
            { label: 'Pending', value: '₹14.8L', color: '#F59E0B' },
          ].map((stat, i) => (
            <div key={i} className="relative bg-[#1E1E2E] rounded-[20px] p-5"
              style={{
                boxShadow: '0 6px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}>
              <div className="absolute inset-0 rounded-[20px] pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 20% 15%, rgba(255,255,255,0.06), transparent 50%)',
                }}
              />

              <div className="relative">
                <div className="text-sm text-[#9CA3AF] font-semibold mb-1">{stat.label}</div>
                <div className="text-3xl font-bold tracking-tight"
                  style={{
                    color: stat.color,
                    textShadow: `0 0 20px ${stat.color}60`,
                  }}>
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Invoice List */}
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="group relative bg-[#1E1E2E] rounded-[20px] p-5 transition-all duration-300 hover:bg-[#252532]"
              style={{
                boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}>
              <div className="absolute inset-0 rounded-[20px] pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 25% 20%, rgba(255,255,255,0.04), transparent 55%)',
                }}
              />

              <div className="relative">
                <div className="flex items-start gap-4 mb-5">
                  {/* Icon */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 bg-[#141420] rounded-xl flex items-center justify-center"
                      style={{
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.3)',
                      }}>
                      <FileSpreadsheet className="w-8 h-8 text-[#6366F1]" />
                    </div>

                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'radial-gradient(circle, rgba(99,102,241,0.3), transparent 70%)',
                        filter: 'blur(12px)',
                      }}
                    />
                  </div>

                  {/* Invoice Header */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-white mb-2 tracking-tight text-lg">{invoice.invoiceNo}</h3>
                        <div className="text-sm text-[#9CA3AF] font-medium">{invoice.client}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-bold text-[#6366F1]">₹{(invoice.total / 100000).toFixed(2)}L</div>
                        <div className="text-xs text-[#6B7280] mt-1">
                          {new Date(invoice.date).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoice Details */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#9CA3AF] mb-4 font-medium">
                  <span>{invoice.items} items</span>
                  <span className="hidden sm:inline text-[#4B5563]">|</span>
                  <span>Subtotal: ₹{(invoice.subtotal / 100000).toFixed(2)}L</span>
                  <span className="hidden sm:inline text-[#4B5563]">|</span>
                  <span>GST: ₹{(invoice.gst / 100000).toFixed(2)}L</span>
                </div>

                {/* Status and Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    invoice.status === 'paid'
                      ? 'bg-green-500/10 text-[#10B981]'
                      : 'bg-orange-500/10 text-[#F59E0B]'
                  }`}
                    style={{
                      boxShadow: invoice.status === 'paid'
                        ? 'inset 0 1px 3px rgba(16,185,129,0.2), 0 0 0 1px rgba(16,185,129,0.2)'
                        : 'inset 0 1px 3px rgba(245,158,11,0.2), 0 0 0 1px rgba(245,158,11,0.2)',
                    }}>
                    {invoice.status === 'paid' ? 'Paid' : 'Pending Payment'}
                  </span>
                  <div className="flex-1 hidden sm:block"></div>
                  <div className="flex items-center gap-2">
                    <AnimatedPressable className="p-2.5 bg-[#141420] text-[#6366F1] rounded-xl"
                      style={{
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                      }}>
                      <Eye className="w-4 h-4" />
                    </AnimatedPressable>
                    <AnimatedPressable className="p-2.5 bg-[#141420] text-[#3B82F6] rounded-xl"
                      style={{
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                      }}>
                      <Download className="w-4 h-4" />
                    </AnimatedPressable>
                    <AnimatedPressable className="p-2.5 bg-[#141420] text-[#EF4444] rounded-xl"
                      style={{
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                      }}>
                      <Trash2 className="w-4 h-4" />
                    </AnimatedPressable>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Invoice Modal */}
      <Modal open={showCreateInvoice} title="Create GST Invoice" maxWidth="max-w-4xl" onClose={() => setShowCreateInvoice(false)}>
        <form className="space-y-5 pt-5">
                {appliedAiInvoice && (
                  <div
                    className="rounded-2xl p-3 border border-white/[0.08]"
                    style={{
                      background: 'radial-gradient(circle at top right, rgba(99,102,241,0.14), rgba(20,20,32,0.88) 55%), #11121A',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 24px rgba(0,0,0,0.25)',
                    }}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 bg-[#0F1B17] border border-[#10B981]/25 text-[#D1FAE5]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                        <span className="text-[11px] font-semibold uppercase tracking-wider">OCR Confidence</span>
                        <span className="text-sm font-bold text-white">{Math.round(appliedAiInvoice.confidence * 100)}%</span>
                      </span>

                      <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 bg-[#1C1515] border border-[#EF4444]/25 text-[#FCA5A5] min-w-0 max-w-full">
                        <FileText className="w-3.5 h-3.5 text-[#EF4444] shrink-0" />
                        <span className="text-[11px] font-semibold uppercase tracking-wider">Original Invoice</span>
                        <span className="text-sm font-semibold text-white truncate max-w-[280px]">
                          {originalInvoiceFileName || 'Attached PDF'}
                        </span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Invoice Metadata */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Vendor Name</label>
                    <input
                      type="text"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                      style={{ boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)' }}
                      placeholder="Vendor / Supplier name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Vendor GSTIN</label>
                    <input
                      type="text"
                      value={vendorGstin}
                      onChange={(e) => setVendorGstin(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                      style={{ boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)' }}
                      placeholder="Vendor GSTIN"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Vendor Address</label>
                  <textarea
                    rows={2}
                    value={vendorAddress}
                    onChange={(e) => setVendorAddress(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                    style={{ boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)' }}
                    placeholder="Vendor address"
                  />
                </div>

                {/* Client Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Buyer Name *</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                      style={{
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                      }}
                      placeholder="Enter client name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Buyer GSTIN</label>
                    <input
                      type="text"
                      value={clientGstin}
                      onChange={(e) => setClientGstin(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                      style={{
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                      }}
                      placeholder="22AAAAA0000A1Z5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Buyer Address</label>
                  <textarea
                    rows={2}
                    value={buyerAddress}
                    onChange={(e) => setBuyerAddress(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                    style={{ boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)' }}
                    placeholder="Buyer address"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Invoice Number</label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                      style={{ boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)' }}
                      placeholder="INV-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">PO Number</label>
                    <input
                      type="text"
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                      style={{ boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)' }}
                      placeholder="PO-123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Currency</label>
                    <input
                      type="text"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                      className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                      style={{ boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)' }}
                      placeholder="INR"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Invoice Date</label>
                    <NeumorphicDatePicker
                      value={invoiceDate}
                      onChange={setInvoiceDate}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Due Date</label>
                    <NeumorphicDatePicker
                      value={dueDate}
                      onChange={setDueDate}
                      placeholder="Select due date"
                    />
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-[#9CA3AF]">Line Items</label>
                    <AnimatedPressable
                      type="button"
                      onClick={addLine}
                      className="px-3 py-1.5 rounded-xl text-white text-sm font-semibold flex items-center gap-1"
                      style={{
                        background: 'linear-gradient(135deg, #6366F1, #818CF8)',
                        boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Line
                    </AnimatedPressable>
                  </div>

                  <div className="space-y-3">
                    {lineItems.map((item, idx) => {
                      const { taxable, gstAmt, total } = calcLine(item);
                      const hsnMatches = item.hsn.length >= 3
                        ? HSN_CODES.filter(h =>
                            h.code.startsWith(item.hsn) ||
                            h.desc.toLowerCase().includes(item.hsn.toLowerCase())
                          ).slice(0, 6)
                        : [];
                      return (
                        <div key={idx} className="p-4 bg-[#141420] rounded-xl space-y-3"
                          style={{ boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)' }}>

                          {/* HSN + GST badge + delete */}
                          <div className="flex gap-2 items-start">
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                value={item.hsn}
                                onChange={e => {
                                  updateLine(idx, 'hsn', e.target.value);
                                  setHsnDropdown(idx);
                                }}
                                onFocus={() => item.hsn.length >= 3 && setHsnDropdown(idx)}
                                onBlur={() => setTimeout(() => setHsnDropdown(null), 200)}
                                placeholder="HSN Code (type 3+ chars for suggestions)"
                                className="w-full px-3 py-2 bg-[#0F1117] rounded-lg text-sm text-white placeholder:text-[#6B7280] focus:outline-none"
                                style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)' }}
                              />
                              {hsnDropdown === idx && hsnMatches.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-[#252532] rounded-xl overflow-hidden z-50"
                                  style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.25)' }}>
                                  {hsnMatches.map(h => (
                                    <AnimatedPressable
                                      key={`${idx}-${h.code}`}
                                      type="button"
                                      onMouseDown={() => selectHSN(idx, h)}
                                      className="w-full flex items-center justify-between px-3 py-2.5 text-left gap-2"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-xs font-bold text-[#6366F1] flex-shrink-0">{h.code}</span>
                                        <span className="text-xs text-[#9CA3AF] truncate">{h.desc}</span>
                                      </div>
                                      <span className="text-xs font-bold text-[#F59E0B] flex-shrink-0">GST {h.gst}%</span>
                                    </AnimatedPressable>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-2 bg-[#0F1117] rounded-lg flex-shrink-0"
                              style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)' }}>
                              <span className="text-xs text-[#6B7280] font-medium">GST</span>
                              <NeumorphicSelect
                                value={String(item.gst)}
                                onChange={(v) => updateLine(idx, 'gst', Number(v))}
                                compact
                                options={[
                                  { value: '28', label: '28%' },
                                  { value: '18', label: '18%' },
                                  { value: '12', label: '12%' },
                                  { value: '5',  label: '5%'  },
                                  { value: '0',  label: '0%'  },
                                ]}
                                className="w-20"
                              />
                            </div>
                            {lineItems.length > 1 && (
                              <AnimatedPressable
                                type="button"
                                onClick={() => removeLine(idx)}
                                className="p-2 bg-[#0F1117] text-[#EF4444] rounded-lg flex-shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </AnimatedPressable>
                            )}
                          </div>

                          {/* Description */}
                          <textarea
                            value={item.description}
                            onChange={e => updateLine(idx, 'description', e.target.value)}
                            rows={2}
                            placeholder="Description of goods / services..."
                            className="w-full px-3 py-2 bg-[#0F1117] rounded-lg text-sm text-white placeholder:text-[#6B7280] focus:outline-none resize-none"
                            style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)' }}
                          />

                          {/* Price, Qty, Unit, Discount, Type */}
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1 block">Price / Unit (₹)</label>
                              <input
                                type="number"
                                min="0"
                                value={item.rate || ''}
                                onChange={e => updateLine(idx, 'rate', parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                className="w-full px-3 py-2 bg-[#0F1117] rounded-lg text-sm text-white placeholder:text-[#6B7280] focus:outline-none"
                                style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)' }}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1 block">Units / Qty</label>
                              <input
                                type="number"
                                min="1"
                                value={item.qty}
                                onChange={e => updateLine(idx, 'qty', parseFloat(e.target.value) || 1)}
                                className="w-full px-3 py-2 bg-[#0F1117] rounded-lg text-sm text-white focus:outline-none"
                                style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)' }}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1 block">Unit</label>
                              <input
                                type="text"
                                value={item.unit}
                                onChange={e => updateLine(idx, 'unit', e.target.value)}
                                placeholder="PCS"
                                className="w-full px-3 py-2 bg-[#0F1117] rounded-lg text-sm text-white placeholder:text-[#6B7280] focus:outline-none"
                                style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)' }}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1 block">Discount</label>
                              <input
                                type="number"
                                min="0"
                                value={item.discount || ''}
                                onChange={e => updateLine(idx, 'discount', parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                className="w-full px-3 py-2 bg-[#0F1117] rounded-lg text-sm text-white placeholder:text-[#6B7280] focus:outline-none"
                                style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)' }}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1 block">Disc. Type</label>
                              <NeumorphicSelect
                                value={item.discountType}
                                onChange={(v) => updateLine(idx, 'discountType', v)}
                                compact
                                options={[
                                  { value: 'percent', label: '% Percent' },
                                  { value: 'flat',    label: '₹ Flat'    },
                                ]}
                              />
                            </div>
                          </div>

                          {/* Line total summary */}
                          <div className="flex items-center justify-between pt-2 border-t border-[#0F1117]">
                            <div className="flex items-center gap-4 text-xs text-[#6B7280]">
                              <span>Taxable: <span className="text-[#9CA3AF] font-semibold">₹{taxable.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span></span>
                              <span>GST: <span className="text-[#9CA3AF] font-semibold">₹{gstAmt.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span></span>
                              {item.hsn && <span>HSN: <span className="text-[#9CA3AF] font-semibold">{item.hsn}</span></span>}
                              {item.unit && <span>Unit: <span className="text-[#9CA3AF] font-semibold">{item.unit}</span></span>}
                            </div>
                            <span className="text-sm font-bold text-[#6366F1]">₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-[#141420] rounded-xl p-4"
                  style={{
                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.2)',
                  }}>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#9CA3AF]">Gross Amount:</span>
                      <span className="font-semibold text-white">₹{displayedTotals.gross.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>
                    {displayedTotals.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#9CA3AF]">Total Discount:</span>
                        <span className="font-semibold text-[#EF4444]">−₹{displayedTotals.discount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-[#9CA3AF]">Taxable Value:</span>
                      <span className="font-semibold text-white">₹{displayedTotals.subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#9CA3AF]">Total GST:</span>
                      <span className="font-semibold text-white">₹{displayedTotals.gst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>
                    {displayedTotals.cgst > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#9CA3AF]">CGST:</span>
                        <span className="font-semibold text-white">₹{displayedTotals.cgst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    {displayedTotals.sgst > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#9CA3AF]">SGST:</span>
                        <span className="font-semibold text-white">₹{displayedTotals.sgst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    {displayedTotals.igst > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#9CA3AF]">IGST:</span>
                        <span className="font-semibold text-white">₹{displayedTotals.igst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    {displayedTotals.cess > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#9CA3AF]">CESS:</span>
                        <span className="font-semibold text-white">₹{displayedTotals.cess.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    {displayedTotals.rounding !== 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#9CA3AF]">Rounding:</span>
                        <span className="font-semibold text-white">₹{displayedTotals.rounding.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-[#1E1E2E]">
                      <span className="font-bold text-white">Grand Total:</span>
                      <span className="font-bold text-[#6366F1] text-lg">₹{displayedTotals.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Notes/Terms</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                    style={{
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                    }}
                    placeholder="Payment terms, delivery notes, etc."
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <AnimatedPressable
                    type="button"
                    onClick={() => setShowCreateInvoice(false)}
                    className="flex-1 px-3 py-2 bg-[#141420] rounded-xl text-[#9CA3AF] font-medium text-sm"
                    style={{
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                    }}
                  >
                    Cancel
                  </AnimatedPressable>
                  <AnimatedPressable
                    type="button"
                    onClick={() => {
                      if (appliedAiInvoice) setShowPreviewSheet(true);
                    }}
                    className="flex-1 px-3 py-2 bg-[#1E1E2E] rounded-xl text-[#6366F1] font-semibold flex items-center justify-center gap-1.5 text-sm whitespace-nowrap"
                    style={{
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                    }}
                  >
                    <Eye className="w-4 h-4 flex-shrink-0" />
                    Preview PDF
                  </AnimatedPressable>
                  <AnimatedPressable
                    type="button"
                    className="flex-1 px-3 py-2 rounded-xl text-white font-semibold text-sm whitespace-nowrap"
                    style={{
                      background: 'linear-gradient(135deg, #6366F1, #818CF8)',
                      boxShadow: '0 8px 24px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                    }}
                  >
                    Save as Receivable
                  </AnimatedPressable>
                  <AnimatedPressable
                    type="button"
                    className="flex-1 px-3 py-2 rounded-xl text-white font-semibold text-sm whitespace-nowrap"
                    style={{
                      background: 'linear-gradient(135deg, #F97316, #EF4444)',
                      boxShadow: '0 8px 24px rgba(249,115,22,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
                    }}
                  >
                    Save as Payable
                  </AnimatedPressable>
                </div>
              </form>
      </Modal>

      <Modal
        open={showPreviewSheet}
        title="Invoice Preview"
        subtitle="Rendered from OCR parsed schema"
        maxWidth="max-w-2xl"
        onClose={() => setShowPreviewSheet(false)}
      >
        <div className="pt-3">
          {appliedAiInvoice ? (
            <RenderedInvoice invoice={appliedAiInvoice} />
          ) : (
            <div className="rounded-xl px-3 py-2 bg-[#141420] text-sm text-[#9CA3AF]">
              No parsed invoice available to preview.
            </div>
          )}
        </div>
      </Modal>

      <AiInvoiceReaderFlow
        open={showAiReader}
        onClose={() => setShowAiReader(false)}
        onApply={handleAiApply}
      />

      <BottomNavbar />
    </div>
  );
}
