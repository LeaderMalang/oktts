export type UserRole = 'SUPER_ADMIN' | 'CUSTOMER' | 'MANAGER' | 'SALES' | 'DELIVERY' | 'WAREHOUSE_ADMIN' | 'DELIVERY_MANAGER' | 'RECOVERY_OFFICER' | 'INVESTOR';

export interface User {
    id: number;
    name: string;
    email: string;
    password?: string; // Should not be stored in frontend state long-term
    role: UserRole;
}

export type OrderStatus = 'Pending Approval' | 'Approved' | 'Processing' | 'Dispatched' | 'Delivered' | 'Cancelled' | 'Returned' | 'Draft';
export type InvoiceStatus = 'Paid' | 'Pending' | 'Draft' | 'Cancelled' | 'Returned';


export type Page = 
  | 'dashboard' 
  | 'new-sale-invoice' 
  | 'purchase-invoices' 
  | 'new-purchase-invoice' 
  | 'reports' 
  | 'inventory' 
  | 'hr' 
  | 'management' 
  | 'sale-invoices' 
  | 'new-sale-return' 
  | 'new-purchase-return' 
  | 'sale-returns' 
  | 'purchase-returns' 
  | 'pos' 
  | 'expenses'
  // New Pages
  | 'login'
  | 'register'
  | 'order-management'
  | 'order-detail'
  | 'my-orders'
  | 'crm'
  | 'tasks'
  | 'recovery-officer-dashboard'
  | 'credit-recovery'
  | 'my-leave'
  | 'ledger'
  | 'stock-audit'
  | 'investors'
  | 'investor-dashboard'
  | 'investor-ledger';


export interface Area {
    id: number;
    name: string;
    cityId: number;
}

export interface Supplier {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  barcode: string;
  companyId: number;
  groupId: number;
  distributorId: number;
  tradePrice: number;
  retailPrice: number;
  salesTaxRatio: number;
  fedTaxRatio: number;
  disableSalePurchase: boolean;
}

export interface Batch {
  id: number;
  productId: number;
  batchNo: string;
  expiryDate: string; // YYYY-MM-DD
  rate: number;
  stock: number;
}

export interface InvoiceItem {
  id: string; // Temporary client-side ID
  productId: number | null;
  batchId: number | null;
  packing: number | null;
  bonus: number;
  quantity: number;
  rate: number;
  amount: number; // before discount
  discount1: number; // percentage
  discount2: number; // percentage
  netAmount: number; // after discounts
}

export interface PurchaseInvoiceItem {
    id: string; // Temporary client-side ID
    productId: number | null;
    batchNo: string;
    expiryDate: string;
    quantity: number;
    bonus: number;
    rate: number;
    discount: number; // percentage
    amount: number; // qty * rate
    netAmount: number; // amount after discount
}

export interface RecoveryLog {
    id: number;
    invoiceId: number;
    employeeId: number | null;
    date: string; // ISO Timestamp
    notes: string;
}


export interface Order {
  id: string;
  invoiceNo: string;
  status: OrderStatus;
  customer: Party | null;
  customerId?: number | null; // for API submissions
  warehouseId?: number | null;
  salesmanId?: number | null;
  cityId: number | null;
  areaId: number | null;
  supplyingManId: number | null;
  bookingManId: number | null;
  deliveryManId?: number | null;
  companyInvoiceNumber?: string;
  date: string;
  items: InvoiceItem[];
  subTotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  netAmount?: number;
  paidAmount?: number;
  qrCode: string | null;
  paymentMethod: 'Cash' | 'Credit';
  recoveryLogs?: RecoveryLog[];
  // Deprecated fields for backward compatibility
  userId?: number;
  companyName?: string;
}


export interface PurchaseInvoice {
  id: string;
  invoiceNo: string;
  status: InvoiceStatus;
  supplier: Supplier | null;
  date: string;
  companyInvoiceNumber: string;
  items: PurchaseInvoiceItem[];
  subTotal: number;
  discount: number; // As a percentage for the whole invoice
  tax: number; // As a percentage
  grandTotal: number;
  paymentMethod: 'Cash' | 'Credit';
  paidAmount?: number;
  investorId?: number;
}

export interface SaleReturnItem {
    id: string; // temp client-side ID
    productId: number | null;
    batchNo: string;
    expiryDate: string;
    quantity: number;
    rate: number;
    discount1: number;
    discount2: number;
    amount: number;
    netAmount: number;
}

export interface SaleReturn {
    id: string;
    returnNo: string;
    customer: Party | null;
    warehouseId: number | null;
    date: string;
    items: SaleReturnItem[];
    totalAmount: number;
    // Deprecated for compatibility
    status?: InvoiceStatus;
}


export interface PurchaseReturnItem {
    id: string; // temp client-side ID
    productId: number | null;
    batchNo: string;
    quantity: number;
    rate: number;
    amount: number;
}

export interface PurchaseReturn {
    id: string;
    returnNo: string;
    status: InvoiceStatus;
    supplier: Supplier | null;
    date: string;
    items: PurchaseReturnItem[];
    grandTotal: number;
}


// HR Module Types
export type EmployeeRole = 'SALES' | 'DELIVERY' | 'ADMIN' | 'MANAGER' | 'WAREHOUSE_ADMIN' | 'DELIVERY_MANAGER' | 'RECOVERY_OFFICER';
export type LeaveType = 'ANNUAL' | 'SICK' | 'CASUAL';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Employee {
    id: number;
    name: string;
    role: EmployeeRole;
    phone: string;
    email?: string;
    active: boolean;
}

export interface LeaveRequest {
    id: number;
    employeeId: number;
    employeeName: string; // Denormalized for easy display
    leaveType: LeaveType;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    reason?: string;
    status: LeaveStatus;
}

export interface AttendanceRecord {
    id: string; // e.g., `${employeeId}-${date}`
    employeeId: number;
    employeeName: string;
    date: string; // YYYY-MM-DD
    checkIn: string | null; // HH:MM
    checkOut: string | null; // HH:MM
    isAbsent: boolean;
}

export interface EmployeeContract {
    id: number;
    employeeId: number;
    startDate: string; // YYYY-MM-DD
    endDate: string | null; // YYYY-MM-DD
    salary: number;
    notes?: string;
}

export interface SalesTarget {
    id: number;
    employeeId: number;
    month: string; // YYYY-MM-01
    targetAmount: number;
}

// Inventory Module Types
export type MovementType = 'IN' | 'OUT' | 'ADJUST';
export interface StockMovement {
    id: number;
    productId: number;
    batchNo: string;
    movementType: MovementType;
    quantity: number;
    reason: string;
    timestamp: string; // ISO 8601
}


// Management Module Types
export interface Company {
    id: number;
    name: string;
}

export interface ProductGroup {
    id: number;
    name: string;
}

export interface Distributor {
    id: number;
    name: string;
}

export interface City {
    id: number;
    name: string;
}

export interface Branch {
    id: number;
    name: string;
    address: string;
}

export interface Warehouse {
    id: number;
    name: string;
    branchId: number;
}

export type PartyType = 'customer' | 'supplier' | 'investor';

export interface Party {
    id: number;
    name: string;
    address: string;
    phone: string;
    partyType: PartyType;
    cityId?: number;
    areaId?: number;
    proprietor?: string;
    licenseNo?: string;
    licenseExpiry?: string;
    category?: string;
    latitude?: number | null;
    longitude?: number | null;
    creditLimit?: number;
    currentBalance?: number;
    priceListId?: number | null;
}

export type AccountTypeName = 'ASSET' | 'LIABILITY' | 'INCOME' | 'EXPENSE' | 'EQUITY';

export interface ChartOfAccount {
    id: number;
    name: string;
    code: string;
    accountType: AccountTypeName;
    parentId: number | null;
    isActive: boolean;
}

// Expense Module Types
export interface ExpenseCategory {
    id: number;
    name: string;
}

export interface Expense {
    id: number;
    date: string; // YYYY-MM-DD
    categoryId: number;
    payee: string;
    description: string;
    amount: number;
    paymentMethod: 'Cash' | 'Credit';
}


// Pricing Module Types
export interface PriceList {
    id: number;
    name: string;
    description?: string;
}

export interface PriceListItem {
    id: number;
    priceListId: number;
    productId: number;
    customPrice: number;
}

// Notification Type
export interface Notification {
  id: number;
  message: string;
  timestamp: string;
  read: boolean;
  link: Page;
}

// CRM Module Types
export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Unqualified' | 'Converted';
export interface Lead {
    id: number;
    name: string;
    contactPerson: string;
    phone: string;
    email?: string;
    address?: string;
    status: LeadStatus;
    source?: string;
    assignedTo: number; // employeeId
    notes?: string;
    createdAt: string;
}

export type InteractionType = 'Call' | 'Email' | 'Meeting' | 'Note';
export interface Interaction {
    id: number;
    partyId: number; // Can refer to a Customer (Party) or a Lead
    partyType: 'customer' | 'lead';
    employeeId: number;
    type: InteractionType;
    summary: string;
    date: string; // ISO timestamp
    followUpDate?: string; // YYYY-MM-DD
}

// Task Management Types
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export interface Task {
    id: number;
    title: string;
    description?: string;
    assignedTo: number; // employeeId
    dueDate: string; // YYYY-MM-DD
    status: TaskStatus;
    relatedTo?: {
        type: 'SaleInvoice' | 'PurchaseInvoice' | 'Customer' | 'Lead';
        id: string | number;
        name: string;
    };
    createdAt: string;
}

// Investor Module Types
export type InvestorTransactionType = 'INVESTMENT' | 'PAYOUT' | 'PROFIT_SHARE';

export interface InvestorTransaction {
    id: number;
    investorId: number;
    type: InvestorTransactionType;
    amount: number;
    date: string; // YYYY-MM-DD
    notes?: string;
    relatedPurchaseInvoiceId?: string;
}

// Offline Sync Type
export interface SyncQueueItem {
    id?: number; // Auto-incremented by IndexedDB
    endpoint: string;
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    payload: any;
    timestamp: number;
}