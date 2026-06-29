// ─── Company & Site ───────────────────────────────────────────────────────────

export interface Company {
  id: number;
  name: string;
  sites: number;
  employees: number;
  location: string;
  color: string;
}

export interface CreateCompanyInput {
  name: string;
  companyType: string;
  cin?: string;
  gstin?: string;
  addressLine1?: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  logo?: File | null;
  officialEmail?: string;
  officialContact?: string;
  officialMobile?: string;
}

export interface Site {
  id: number;
  name: string;
  location: string;
  alerts: number;
  attendance: number;
  totalWorkers: number;
  lowStockItems: number;
  progress: number;
  color: string;
}

export interface SiteModule {
  id: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  path: string;
  color: string;
  description: string;
}

// ─── Employee ────────────────────────────────────────────────────────────────

export interface Employee {
  id: number;
  name: string;
  role: string;
  phone: string;
  email: string;
  pan: string;
  aadhaar: string;
  photo: string | null;
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export interface RecognizedFace {
  id: number;
  name: string;
  position: { x: number; y: number };
  status: string;
}

export interface ManualAttendanceRecord {
  id: number;
  name: string;
  role: string;
  checkIn: string;
  status: 'present' | 'late' | 'absent';
}

// ─── Payroll ─────────────────────────────────────────────────────────────────

export interface PayrollEntry {
  id: number;
  name: string;
  role: string;
  daysWorked: number;
  dailyWage: number;
  overtime: number;
  bonus: number;
  pf: number;
  esi: number;
  advances: number;
}

export interface PayrollCalculation {
  basicSalary: number;
  gross: number;
  deductions: number;
  net: number;
}

export interface PayrollTotals {
  gross: number;
  deductions: number;
  net: number;
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export type InventoryStatus = 'good' | 'low' | 'critical';

export interface InventoryItem {
  id: number;
  name: string;
  stock: number;
  unit: string;
  minStock: number;
  unitCost: number;
  status: InventoryStatus;
}

// ─── Expense ─────────────────────────────────────────────────────────────────

export interface Expense {
  id: number;
  date: string;
  description: string;
  category: string;
  amount: number;
  vendor: string;
  hasReceipt: boolean;
}

// ─── Invoice ─────────────────────────────────────────────────────────────────

export type InvoiceStatus = 'paid' | 'pending' | 'overdue';

export interface InvoiceLineItem {
  description: string;
  hsn: string;
  qty: number;
  rate: number;
  gst: number;
  discount: number;
  discountType: 'flat' | 'percent';
}

export interface Invoice {
  id: number;
  invoiceNo: string;
  date: string;
  client: string;
  items: number;
  subtotal: number;
  gst: number;
  total: number;
  status: InvoiceStatus;
}

// ─── Equipment ───────────────────────────────────────────────────────────────

export type EquipmentStatus = 'available' | 'in-use' | 'maintenance';

export interface Equipment {
  id: number;
  name: string;
  assetId: string;
  status: EquipmentStatus;
  location: string;
  checkedOutBy: string | null;
  checkedOutDate: string | null;
  nextMaintenance: string;
}

export interface EquipmentStatusBadge {
  color: string;
  bgColor: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
}

export interface EquipmentStats {
  available: number;
  inUse: number;
  maintenance: number;
}

// ─── Tender ──────────────────────────────────────────────────────────────────

export type TenderStatus = 'open' | 'upcoming' | 'closed';

export interface TenderAttachment {
  name: string;
  size: string;
}

export interface Tender {
  id: number;
  title: string;
  tenderNumber: string;
  location: string;
  issueDate: string;
  closingDate: string;
  status: TenderStatus;
  estimatedValue: number;
  highestBid: number | null;
  totalBids: number;
  description: string;
  attachments: TenderAttachment[];
  category: string;
}

export interface TenderStatusBadge {
  color: string;
  bgColor: string;
  label: string;
}

export interface TenderCounts {
  open: number;
  upcoming: number;
  closed: number;
}

// ─── Daily Report ────────────────────────────────────────────────────────────

export interface DailyReport {
  id: number;
  date: string;
  foreman: string;
  workCompleted: string;
  materials: string;
  workers: number;
  weather: string;
  photos: number;
}

// ─── Material Shops ──────────────────────────────────────────────────────────

export interface ShopInventoryItem {
  id: number;
  name: string;
  brand: string;
  stock: number;
  unit: string;
  price: number;
}

export interface MaterialShop {
  id: number;
  name: string;
  address: string;
  pincode: string;
  distance: number;
  rating: number;
  phone: string;
  openTime: string;
  inventory: ShopInventoryItem[];
}

// ─── API Input Types ──────────────────────────────────────────────────────────
// Used by the API layer for create/update operations.
// Omitting 'id' keeps the contract clean — the backend assigns IDs.

export type CreateEmployeeInput = Omit<Employee, 'id'>;
export type UpdateEmployeeInput = Partial<CreateEmployeeInput> & { id: number };

export type CreateInventoryItemInput = Omit<InventoryItem, 'id'>;
export type UpdateInventoryItemInput = Partial<CreateInventoryItemInput> & { id: number };

export type CreateExpenseInput = Omit<Expense, 'id'>;
export type UpdateExpenseInput = Partial<CreateExpenseInput> & { id: number };

export type CreateInvoiceInput = Omit<Invoice, 'id'>;
export type UpdateInvoiceInput = Partial<CreateInvoiceInput> & { id: number };

export type CreatePayrollEntryInput = Omit<PayrollEntry, 'id'>;
export type UpdatePayrollEntryInput = Partial<CreatePayrollEntryInput> & { id: number };

export type CreateEquipmentInput = Omit<Equipment, 'id'>;
export type UpdateEquipmentInput = Partial<CreateEquipmentInput> & { id: number };

export type CreateTenderInput = Omit<Tender, 'id'>;
export type UpdateTenderInput = Partial<CreateTenderInput> & { id: number };

export type CreateDailyReportInput = Omit<DailyReport, 'id'>;

export type MarkAttendanceInput = {
  employeeId: number;
  status: ManualAttendanceRecord['status'];
  checkIn: string;
};
