// ─── Attendance ───────────────────────────────────────────────────────────────

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  LATE: 'late',
  ABSENT: 'absent',
} as const;

// ─── Inventory ───────────────────────────────────────────────────────────────

export const INVENTORY_STATUS = {
  GOOD: 'good',
  LOW: 'low',
  CRITICAL: 'critical',
} as const;

// ─── Equipment ───────────────────────────────────────────────────────────────

export const EQUIPMENT_STATUS = {
  AVAILABLE: 'available',
  IN_USE: 'in-use',
  MAINTENANCE: 'maintenance',
} as const;

// ─── Tender ──────────────────────────────────────────────────────────────────

export const TENDER_STATUS = {
  OPEN: 'open',
  UPCOMING: 'upcoming',
  CLOSED: 'closed',
} as const;

// ─── Invoice ─────────────────────────────────────────────────────────────────

export const INVOICE_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  OVERDUE: 'overdue',
} as const;

// ─── Expense Categories ───────────────────────────────────────────────────────

export const EXPENSE_CATEGORIES = [
  'Materials',
  'Labour',
  'Equipment',
  'Safety',
  'Transport',
  'Miscellaneous',
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

// ─── GST Rate ────────────────────────────────────────────────────────────────

export const DEFAULT_GST_RATE = 18;

// ─── Default Invoice Line Item ────────────────────────────────────────────────

export const DEFAULT_LINE_ITEM = {
  description: '',
  hsn: '',
  qty: 1,
  rate: 0,
  gst: DEFAULT_GST_RATE,
  discount: 0,
  discountType: 'percent' as 'flat' | 'percent',
};

// ─── Site Module Definitions ─────────────────────────────────────────────────
// Note: icon references are resolved in SiteOverview component

// ─── Company ───────────────────────────────────────────────────────────────────

export const COMPANY_TYPES = [
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'private_limited', label: 'Private Limited (Pvt Ltd)' },
  { value: 'public_limited', label: 'Public Limited' },
  { value: 'llp', label: 'Limited Liability Partnership (LLP)' },
  { value: 'opc', label: 'One Person Company (OPC)' },
  { value: 'partnership', label: 'Partnership Firm' },
  { value: 'section_8', label: 'Section 8 Company (Non-profit)' },
  { value: 'other', label: 'Other' },
] as const;

export type CompanyTypeValue = (typeof COMPANY_TYPES)[number]['value'];

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const;

// ─── Site Module Definitions ─────────────────────────────────────────────────

export const SITE_MODULE_PATHS = {
  INVENTORY: '/inventory',
  EXPENSES: '/expenses',
  ATTENDANCE: '/attendance',
  EMPLOYEES: '/employees',
  PAYROLL: '/payroll',
  TENDERS: '/tenders',
  MATERIAL_SHOPS: '/material-shops',
  TASKS: '/tasks',
  DAILY_REPORTS: '/daily-reports',
  INVOICES: '/invoices',
  EQUIPMENT: '/equipment',
} as const;
