import React from 'react';
import { Product, Batch, Supplier, Employee, LeaveRequest, Company, ProductGroup, Distributor, City, Branch, Warehouse, Party, ChartOfAccount, Order, PurchaseInvoice, Area, SaleReturn, PurchaseReturn, StockMovement, EmployeeContract, SalesTarget, ExpenseCategory, Expense, PriceList, PriceListItem, User, Notification, Lead, Interaction, Task, InvestorTransaction, AttendanceRecord } from './types';

export const ICONS = {
  dashboard: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
  invoice: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  purchase: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  reports: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8a6 6 0 0 0-6-6"/><path d="M13 8a6 6 0 0 0-6-6"/><path d="M13 18a6 6 0 0 0 6-6"/></svg>,
  inventory: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="3" x2="9" y2="21"></line></svg>,
  hr: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  crm: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  tasks: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="m9 14 2 2 4-4"/></svg>,
  management: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8"/><path d="M10 19v-3.96"/><path d="M7 19h5"/><path d="M22 12v3a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2z"/><path d="M15 12v3a2 2 0 0 0 2 2h1"/></svg>,
  plus: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  trash: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>,
  sparkles: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>,
  list: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>,
  product: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
  return: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 14 4 9 9 4"></polyline><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"></path></svg>,
  search: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  pos: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Z"/><path d="M12 18V8"/><path d="M8 18V8"/><path d="M16 18V8"/><path d="M6 12h12"/></svg>,
  expense: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
  logout: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
  orders: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
  qr_code: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><path d="M3 14h7v7H3z"/></svg>,
  recovery: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
  leave: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 17a5 5 0 0 1-5-5v-2a5 5 0 0 1 5-5h11v12H8z"/><path d="M15 17v-2a3 3 0 0 0-3-3H6"/></svg>,
  ledger: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  stock_audit: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="m9 14 2 2 4-4"/></svg>,
  investor: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
};


export const USERS: User[] = [
    { id: 1, name: 'Admin User', email: 'admin@pharma.com', password: 'password', role: 'SUPER_ADMIN' },
    { id: 101, name: 'City Pharmacy Rep', email: 'cp@pharma.com', password: 'password', role: 'CUSTOMER' },
    { id: 102, name: 'Wellness Drug Rep', email: 'wd@pharma.com', password: 'password', role: 'CUSTOMER' },
    { id: 201, name: 'Walter House', email: 'warehouse@pharma.com', password: 'password', role: 'WAREHOUSE_ADMIN'},
    { id: 202, name: 'David Manager', email: 'delivery@pharma.com', password: 'password', role: 'DELIVERY_MANAGER'},
    { id: 203, name: 'Rachel Officer', email: 'recovery@pharma.com', password: 'password', role: 'RECOVERY_OFFICER'},
    { id: 301, name: 'Ivy Investor', email: 'investor@pharma.com', password: 'password', role: 'INVESTOR'}
];

export const CITIES: City[] = [
    { id: 1, name: 'Metropolis' },
    { id: 2, name: 'Gotham City' },
    { id: 3, name: 'Rajana' }
];

export const AREAS: Area[] = [
    { id: 1, name: 'Downtown', cityId: 1 },
    { id: 2, name: 'Midtown', cityId: 1 },
    { id: 3, name: 'Uptown', cityId: 1 },
    { id: 4, name: 'East End', cityId: 2 },
    { id: 5, name: 'The Bowery', cityId: 2 },
    { id: 6, name: 'Main Bazaar', cityId: 3 },
    { id: 7, name: 'Chak 285 GB', cityId: 3 }
];

export const SUPPLIERS: Supplier[] = [
    { id: 1, name: 'PharmaCo Global' },
    { id: 2, name: 'MedLife Supplies' },
    { id: 3, name: 'HealthWell Distribution' },
    { id: 4, name: 'BeauSkin Creations' }
];

export const COMPANIES: Company[] = [
    { id: 1, name: 'PharmaCo' },
    { id: 2, name: 'MedLife' },
    { id: 3, name: 'HealthWell' },
    { id: 4, name: 'BeauSkin' }
];

export const PRODUCT_GROUPS: ProductGroup[] = [
    { id: 1, name: 'Analgesics' },
    { id: 2, name: 'Antibiotics' },
    { id: 3, name: 'Vitamins' },
    { id: 4, name: 'Dermatology' }
];

export const DISTRIBUTORS: Distributor[] = [
    { id: 1, name: 'National Pharma Distributors' },
    { id: 2, name: 'Regional Med Supplies' }
];


export const PRODUCTS: Product[] = [
  { id: 101, name: 'Paracetamol 500mg', barcode: '89912345001', companyId: 1, groupId: 1, distributorId: 1, tradePrice: 8.5, retailPrice: 10.50, salesTaxRatio: 17, fedTaxRatio: 0, disableSalePurchase: false },
  { id: 102, name: 'Amoxicillin 250mg', barcode: '89912345002', companyId: 2, groupId: 2, distributorId: 1, tradePrice: 20, retailPrice: 25, salesTaxRatio: 17, fedTaxRatio: 0, disableSalePurchase: false },
  { id: 103, name: 'Vitamin C 1000mg', barcode: '89912345003', companyId: 3, groupId: 3, distributorId: 2, tradePrice: 12, retailPrice: 15.75, salesTaxRatio: 0, fedTaxRatio: 0, disableSalePurchase: false },
  { id: 201, name: 'Moisturizing Cream', barcode: '89912345004', companyId: 4, groupId: 4, distributorId: 2, tradePrice: 35, retailPrice: 45, salesTaxRatio: 17, fedTaxRatio: 5, disableSalePurchase: false },
  { id: 202, name: 'Sunscreen SPF 50', barcode: '89912345005', companyId: 4, groupId: 4, distributorId: 2, tradePrice: 60, retailPrice: 75.50, salesTaxRatio: 17, fedTaxRatio: 5, disableSalePurchase: false },
  { id: 301, name: 'Digital Thermometer', barcode: '89912345006', companyId: 2, groupId: 3, distributorId: 1, tradePrice: 120, retailPrice: 150, salesTaxRatio: 0, fedTaxRatio: 0, disableSalePurchase: true }
];

export const BATCHES: Batch[] = [
  { id: 1, productId: 101, batchNo: 'P-1120', expiryDate: '2025-12-31', rate: 10.50, stock: 500 },
  { id: 2, productId: 101, batchNo: 'P-1121', expiryDate: '2026-06-30', rate: 11.00, stock: 300 },
  { id: 3, productId: 102, batchNo: 'A-5590', expiryDate: '2025-08-31', rate: 25.00, stock: 150 },
  { id: 4, productId: 103, batchNo: 'VC-003', expiryDate: '2026-01-31', rate: 15.75, stock: 800 },
  { id: 5, productId: 201, batchNo: 'BS-881', expiryDate: '2025-10-31', rate: 45.00, stock: 250 },
  { id: 6, productId: 202, batchNo: 'BS-885', expiryDate: '2026-05-31', rate: 75.50, stock: 120 },
  { id: 7, productId: 301, batchNo: 'MT-401', expiryDate: '2028-01-01', rate: 150.00, stock: 90 }
];

export const SALES_BY_CATEGORY = [
    { name: 'Medicines', sales: 4000, color: '#3b82f6' },
    { name: 'Cosmetics', sales: 3000, color: '#ec4899' },
    { name: 'General', sales: 1800, color: '#10b981' }
];

export const EXPENSE_BREAKDOWN = [
    { name: 'Purchases', value: 55, color: '#ef4444' },
    { name: 'Salaries & Wages', value: 25, color: '#f97316' },
    { name: 'Rent', value: 10, color: '#eab308' },
    { name: 'Utilities', value: 10, color: '#22c55e' }
];

// HR Mock Data
export const EMPLOYEES: Employee[] = [
    { id: 1, name: 'John Doe', role: 'MANAGER', phone: '123-456-7890', email: 'john.doe@example.com', active: true },
    { id: 2, name: 'Jane Smith', role: 'SALES', phone: '234-567-8901', email: 'jane.smith@example.com', active: true },
    { id: 3, name: 'Peter Jones', role: 'DELIVERY', phone: '345-678-9012', active: true },
    { id: 4, name: 'Mary Johnson', role: 'ADMIN', phone: '456-789-0123', email: 'mary.j@example.com', active: false },
    { id: 5, name: 'Carlos Ray', role: 'DELIVERY', phone: '567-890-1234', active: true },
    { id: 201, name: 'Walter House', role: 'WAREHOUSE_ADMIN', phone: '111-222-3333', email: 'warehouse@pharma.com', active: true },
    { id: 202, name: 'David Manager', role: 'DELIVERY_MANAGER', phone: '222-333-4444', email: 'delivery@pharma.com', active: true },
    { id: 203, name: 'Rachel Officer', role: 'RECOVERY_OFFICER', phone: '678-901-2345', email: 'rachel.o@example.com', active: true }
];

export const EMPLOYEE_CONTRACTS: EmployeeContract[] = [
    { id: 1, employeeId: 1, startDate: '2022-01-01', endDate: null, salary: 75000, notes: 'Managerial role' },
    { id: 2, employeeId: 2, startDate: '2023-03-15', endDate: null, salary: 55000, notes: 'Sales commission applies' },
    { id: 3, employeeId: 3, startDate: '2023-05-20', endDate: '2024-05-19', salary: 42000, notes: '1-year contract' }
];

export const SALES_TARGETS: SalesTarget[] = [
    { id: 1, employeeId: 2, month: '2024-07-01', targetAmount: 50000 },
    { id: 2, employeeId: 2, month: '2024-08-01', targetAmount: 52000 }
];


export const LEAVE_REQUESTS: LeaveRequest[] = [
    { id: 1, employeeId: 2, employeeName: 'Jane Smith', leaveType: 'ANNUAL', startDate: '2024-08-10', endDate: '2024-08-15', status: 'PENDING', reason: 'Family vacation' },
    { id: 2, employeeId: 3, employeeName: 'Peter Jones', leaveType: 'SICK', startDate: '2024-07-22', endDate: '2024-07-23', status: 'APPROVED' },
    { id: 3, employeeId: 4, employeeName: 'Mary Johnson', leaveType: 'CASUAL', startDate: '2024-07-25', endDate: '2024-07-25', status: 'REJECTED', reason: 'Insufficient staff coverage' },
    { id: 4, employeeId: 2, employeeName: 'Jane Smith', leaveType: 'SICK', startDate: '2024-06-05', endDate: '2024-06-05', status: 'APPROVED' },
    { id: 5, employeeId: 201, employeeName: 'Walter House', leaveType: 'ANNUAL', startDate: '2024-09-01', endDate: '2024-09-05', status: 'PENDING', reason: 'Personal time off' },
    { id: 6, employeeId: 202, employeeName: 'David Manager', leaveType: 'SICK', startDate: '2024-08-05', endDate: '2024-08-05', status: 'APPROVED' }
];

export const ATTENDANCE_RECORDS: AttendanceRecord[] = [
    { id: '1-2024-07-28', employeeId: 1, employeeName: 'John Doe', date: '2024-07-28', checkIn: '09:05', checkOut: '17:30', isAbsent: false },
    { id: '2-2024-07-28', employeeId: 2, employeeName: 'Jane Smith', date: '2024-07-28', checkIn: '09:00', checkOut: '17:25', isAbsent: false },
    { id: '3-2024-07-28', employeeId: 3, employeeName: 'Peter Jones', date: '2024-07-28', checkIn: null, checkOut: null, isAbsent: true },
    { id: '201-2024-07-28', employeeId: 201, employeeName: 'Walter House', date: '2024-07-28', checkIn: '08:55', checkOut: '17:00', isAbsent: false },
    
    { id: '1-2024-07-29', employeeId: 1, employeeName: 'John Doe', date: '2024-07-29', checkIn: '09:10', checkOut: '17:45', isAbsent: false },
    { id: '2-2024-07-29', employeeId: 2, employeeName: 'Jane Smith', date: '2024-07-29', checkIn: '09:02', checkOut: '17:30', isAbsent: false },
    { id: '3-2024-07-29', employeeId: 3, employeeName: 'Peter Jones', date: '2024-07-29', checkIn: '08:45', checkOut: '17:15', isAbsent: false },
    { id: '201-2024-07-29', employeeId: 201, employeeName: 'Walter House', date: '2024-07-29', checkIn: '08:58', checkOut: '17:05', isAbsent: false },
];


// Inventory Mock Data
export const STOCK_MOVEMENTS: StockMovement[] = [
    { id: 1, productId: 101, batchNo: 'P-1120', movementType: 'IN', quantity: 1000, reason: 'Purchase Invoice PI-2024-055', timestamp: '2024-07-25T10:00:00Z' },
    { id: 2, productId: 102, batchNo: 'A-5590', movementType: 'IN', quantity: 500, reason: 'Purchase Invoice PI-2024-055', timestamp: '2024-07-25T10:05:00Z' },
    { id: 3, productId: 101, batchNo: 'P-1120', movementType: 'OUT', quantity: -50, reason: 'Sale Invoice INV-2024-001', timestamp: '2024-07-28T14:30:00Z' },
    { id: 4, productId: 103, batchNo: 'VC-003', movementType: 'ADJUST', quantity: -5, reason: 'Stock count adjustment - damaged', timestamp: '2024-07-29T09:15:00Z' },
    { id: 5, productId: 201, batchNo: 'BS-881', movementType: 'IN', quantity: 200, reason: 'Purchase Invoice PI-2024-056', timestamp: '2024-07-26T11:00:00Z' }
];


// Management Mock Data
export const BRANCHES_DATA: Branch[] = [
    { id: 1, name: 'Main Branch', address: '123 Downtown Ave, Metropolis' },
    { id: 2, name: 'Westside Branch', address: '456 Suburb St, Metropolis' }
];

export const WAREHOUSES_DATA: Warehouse[] = [
    { id: 1, name: 'Central Warehouse', branchId: 1 },
    { id: 2, name: 'West Warehouse', branchId: 2 }
];

export const PARTIES_DATA: Party[] = [
    { id: 101, name: 'City Pharmacy', partyType: 'customer', address: '101 Med Lane, Metropolis', phone: '555-0101', cityId: 1, areaId: 1, proprietor: 'John Smith', licenseNo: 'MET-12345', licenseExpiry: '2025-12-31', category: 'Pharmacy', creditLimit: 50000, currentBalance: 12500, priceListId: 1 },
    { id: 102, name: 'Wellness Drug Store', partyType: 'customer', address: '202 Health Blvd, Metropolis', phone: '555-0102', cityId: 1, areaId: 2, proprietor: 'Jane Doe', licenseNo: 'MET-67890', licenseExpiry: '2026-06-30', category: 'Pharmacy', creditLimit: 25000, currentBalance: 5000, priceListId: null },
    { id: 3, name: 'PharmaCo Global', partyType: 'supplier', address: '500 Supply Rd', phone: '555-0201' },
    { id: 4, name: 'MedLife Supplies', partyType: 'supplier', address: '600 Factory Xing', phone: '555-0202' },
    { id: 103, name: 'Rajana Medical', partyType: 'customer', address: 'Main Bazaar, Rajana', phone: '555-0103', cityId: 3, areaId: 6, proprietor: 'A. Khan', licenseNo: 'RJN-11223', licenseExpiry: '2024-10-15', category: 'Medical Store', creditLimit: 30000, currentBalance: 15000, priceListId: 1 },
    { id: 301, name: 'Ivy Investor', partyType: 'investor', address: '789 Finance Ave', phone: '555-0301' }
];

export const CHART_OF_ACCOUNTS_DATA: ChartOfAccount[] = [
    { id: 1, code: '1000', name: 'Assets', accountType: 'ASSET', parentId: null, isActive: true },
    { id: 2, code: '1100', name: 'Current Assets', accountType: 'ASSET', parentId: 1, isActive: true },
    { id: 3, code: '1110', name: 'Cash', accountType: 'ASSET', parentId: 2, isActive: true },
    { id: 4, code: '1200', name: 'Inventory', accountType: 'ASSET', parentId: 2, isActive: true },
    { id: 5, code: '2000', name: 'Liabilities', accountType: 'LIABILITY', parentId: null, isActive: true },
    { id: 6, code: '4000', name: 'Income', accountType: 'INCOME', parentId: null, isActive: true },
    { id: 7, code: '4100', name: 'Sales Revenue', accountType: 'INCOME', parentId: 6, isActive: true },
    { id: 8, code: '5000', name: 'Expenses', accountType: 'EXPENSE', parentId: null, isActive: true }
];

export const PURCHASE_INVOICES: PurchaseInvoice[] = [
    { id: 'pi-1', invoiceNo: 'PI-2024-055', companyInvoiceNumber: 'PHG-987', supplier: SUPPLIERS[0], date: '2024-07-25', grandTotal: 15200.00, status: 'Paid', items: [], subTotal: 13818.18, discount: 0, tax: 10, paymentMethod: 'Cash', paidAmount: 15200.00 },
    { id: 'pi-2', invoiceNo: 'PI-2024-056', companyInvoiceNumber: 'MS-1234', supplier: SUPPLIERS[1], date: '2024-07-24', grandTotal: 7340.00, status: 'Pending', items: [], subTotal: 6672.73, discount: 0, tax: 10, paymentMethod: 'Credit', paidAmount: 3000.00, investorId: 301 }
];


export const ORDERS: Order[] = [
    { id: '1', invoiceNo: 'INV-2024-001', userId: 101, cityId: 1, areaId: 1, customer: PARTIES_DATA[0], date: '2024-07-28', grandTotal: 2340.50, status: 'Delivered', items: [], subTotal: 2127.73, discount: 0, tax: 10, supplyingManId: 2, bookingManId: 2, companyName: 'PharmaCo', qrCode: 'ORD-1-101-TS20240728', paymentMethod: 'Credit', paidAmount: 2000, recoveryLogs: [
        {id: 1, date: '2024-08-01T10:00:00Z', notes: 'Called customer, payment promised by EOD.', employeeId: 203}
    ] },
    { id: '2', invoiceNo: 'INV-2024-002', userId: 102, cityId: 1, areaId: 2, customer: PARTIES_DATA[1], date: '2024-07-27', grandTotal: 880.00, status: 'Dispatched', items: [], subTotal: 800, discount: 0, tax: 10, supplyingManId: 2, bookingManId: 2, companyName: 'PharmaCo', qrCode: 'ORD-2-102-TS20240727', paymentMethod: 'Credit', paidAmount: 0, recoveryLogs: [] },
    { id: '3', invoiceNo: 'INV-2024-003', userId: 101, cityId: 2, areaId: 4, customer: PARTIES_DATA[0], date: '2024-07-26', grandTotal: 1560.75, status: 'Processing', items: [], subTotal: 1418.86, discount: 0, tax: 10, supplyingManId: 2, bookingManId: 2, companyName: 'MedLife', qrCode: 'ORD-3-101-TS20240726', paymentMethod: 'Credit', paidAmount: 0, recoveryLogs: [] },
    { id: '4', invoiceNo: 'INV-2024-004', userId: 102, cityId: 2, areaId: 5, customer: PARTIES_DATA[1], date: '2024-07-25', grandTotal: 540.00, status: 'Approved', items: [], subTotal: 490.91, discount: 0, tax: 10, supplyingManId: 2, bookingManId: 2, companyName: 'MedLife', qrCode: 'ORD-4-102-TS20240725', paymentMethod: 'Cash', paidAmount: 540.00 },
    { id: '5', invoiceNo: 'INV-2024-005', userId: 101, cityId: 3, areaId: 6, customer: PARTIES_DATA[0], date: '2024-07-29', grandTotal: 3150.00, status: 'Pending Approval', items: [], subTotal: 2863.64, discount: 0, tax: 10, supplyingManId: 2, bookingManId: 2, companyName: 'PharmaCo', qrCode: null, paymentMethod: 'Credit', paidAmount: 0, recoveryLogs: [] }
];

export const SALE_RETURNS: SaleReturn[] = [
    { id: 'sr-1', returnNo: 'SRN-2024-001', customer: PARTIES_DATA[0], date: '2024-07-29', grandTotal: 210.00, status: 'Returned', items: [] },
    { id: 'sr-2', returnNo: 'SRN-2024-002', customer: PARTIES_DATA[1], date: '2024-07-28', grandTotal: 150.75, status: 'Pending', items: [] }
];

export const PURCHASE_RETURNS: PurchaseReturn[] = [
    { id: 'pr-1', returnNo: 'PRN-2024-010', supplier: SUPPLIERS[0], date: '2024-07-26', grandTotal: 1200.00, status: 'Returned', items: [] }
];

// Expense Module Data
export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
    { id: 1, name: 'Salaries & Wages' },
    { id: 2, name: 'Rent' },
    { id: 3, name: 'Utilities (Electricity, Water)' },
    { id: 4, name: 'Office Supplies' },
    { id: 5, name: 'Fuel & Transportation' },
    { id: 6, name: 'Marketing' }
];

export const EXPENSES: Expense[] = [
    { id: 1, date: '2024-07-31', categoryId: 1, payee: 'Staff Payroll', description: 'July 2024 Salaries', amount: 150000, paymentMethod: 'Credit' },
    { id: 2, date: '2024-07-28', categoryId: 5, payee: 'Metro Fuel Station', description: 'Fuel for delivery vans', amount: 8500, paymentMethod: 'Cash' },
    { id: 3, date: '2024-07-25', categoryId: 3, payee: 'City Power Corp', description: 'Electricity bill', amount: 12500, paymentMethod: 'Credit' },
    { id: 4, date: '2024-07-20', categoryId: 2, payee: 'Property Management Inc.', description: 'Warehouse Rent', amount: 75000, paymentMethod: 'Credit' },
    { id: 5, date: '2024-07-15', categoryId: 4, payee: 'Office Depot', description: 'Stationery and supplies', amount: 3200, paymentMethod: 'Cash' }
];

// Pricing Module Data
export const PRICE_LISTS: PriceList[] = [
    { id: 1, name: 'Wholesale Customers', description: 'Standard pricing for regular wholesale clients.' },
    { id: 2, name: 'Retail Chain Special', description: 'Special discounted rates for large retail chains.' },
    { id: 3, name: 'Promotional Campaign Q3', description: 'Temporary promotional prices for Q3 2024.' }
];

export const PRICE_LIST_ITEMS: PriceListItem[] = [
    // Wholesale Prices
    { id: 1, priceListId: 1, productId: 101, customPrice: 9.75 }, // Paracetamol
    { id: 2, priceListId: 1, productId: 102, customPrice: 24.00 }, // Amoxicillin
    { id: 3, priceListId: 1, productId: 201, customPrice: 42.00 }, // Moisturizing Cream
    
    // Retail Chain Special
    { id: 4, priceListId: 2, productId: 101, customPrice: 9.50 },
    { id: 5, priceListId: 2, productId: 102, customPrice: 23.50 },
    { id: 6, priceListId: 2, productId: 103, customPrice: 15.00 },
    { id: 7, priceListId: 2, productId: 201, customPrice: 40.00 },
    { id: 8, priceListId: 2, productId: 202, customPrice: 70.00 }
];

export const NOTIFICATIONS: Notification[] = [
  { id: 1, message: 'Order INV-2024-005 needs your approval.', timestamp: '2024-07-29T11:00:00Z', read: false, link: 'order-management' },
  { id: 2, message: 'Paracetamol 500mg is running low on stock.', timestamp: '2024-07-28T18:30:00Z', read: false, link: 'inventory' },
  { id: 3, message: 'A new sales report for Q3 is available.', timestamp: '2024-07-28T10:00:00Z', read: true, link: 'reports' }
];

// CRM Mock Data
export const LEADS: Lead[] = [
    { id: 1, name: 'General Hospital', contactPerson: 'Dr. Evelyn Reed', phone: '555-0301', email: 'e.reed@ghospital.com', status: 'Qualified', assignedTo: 2, source: 'Referral', createdAt: '2024-07-15T09:00:00Z', notes: 'Interested in bulk antibiotic purchases.' },
    { id: 2, name: 'Corner Clinic', contactPerson: 'Mark Chen', phone: '555-0302', email: 'm.chen@cornerclinic.com', status: 'Contacted', assignedTo: 2, source: 'Walk-in', createdAt: '2024-07-20T14:00:00Z', notes: 'Requested a product catalog.'},
    { id: 3, name: 'The Skin Care Center', contactPerson: 'Dr. Isha Shah', phone: '555-0303', status: 'New', assignedTo: 1, source: 'Website', createdAt: '2024-07-28T11:00:00Z'},
    { id: 4, name: 'Old Town Pharmacy', contactPerson: 'George Miller', phone: '555-0304', status: 'Unqualified', assignedTo: 2, source: 'Cold Call', createdAt: '2024-06-10T16:00:00Z', notes: 'Already has a long-term contract with a competitor.'}
];

export const INTERACTIONS: Interaction[] = [
    { id: 1, partyId: 101, partyType: 'customer', employeeId: 2, type: 'Call', summary: 'Discussed new volume discount structure. Customer is happy.', date: '2024-07-28T15:30:00Z', followUpDate: '2024-08-12' },
    { id: 2, partyId: 1, partyType: 'lead', employeeId: 2, type: 'Email', summary: 'Sent product catalog and pricing for antibiotics.', date: '2024-07-22T10:00:00Z' },
    { id: 3, partyId: 102, partyType: 'customer', employeeId: 1, type: 'Meeting', summary: 'On-site meeting to showcase new cosmetic products. Positive feedback.', date: '2024-07-25T11:00:00Z' },
    { id: 4, partyId: 2, partyType: 'lead', employeeId: 2, type: 'Note', summary: 'Logged initial walk-in visit.', date: '2024-07-20T14:05:00Z', followUpDate: '2024-07-27' }
];

// Task Management Mock Data
export const TASKS: Task[] = [
    { id: 1, title: 'Follow-up on INV-2024-003', description: 'Call City Pharmacy to confirm payment for invoice INV-2024-003.', assignedTo: 2, dueDate: '2024-08-10', status: 'Pending', relatedTo: { type: 'SaleInvoice', id: '3', name: 'INV-2024-003' }, createdAt: '2024-07-26T10:00:00Z' },
    { id: 2, title: 'Prepare stock for PI-2024-055', description: 'Unpack and verify stock received from PharmaCo Global.', assignedTo: 201, dueDate: '2024-07-26', status: 'Completed', relatedTo: { type: 'PurchaseInvoice', id: 'pi-1', name: 'PI-2024-055' }, createdAt: '2024-07-25T11:00:00Z' },
    { id: 3, title: 'Qualify lead: General Hospital', assignedTo: 2, dueDate: '2024-07-30', status: 'In Progress', relatedTo: { type: 'Lead', id: 1, name: 'General Hospital' }, createdAt: '2024-07-22T10:05:00Z' },
    { id: 4, title: 'Check credit limit for Wellness Drug Store', description: 'Review current balance and discuss potential credit limit increase.', assignedTo: 1, dueDate: '2024-08-05', status: 'Pending', relatedTo: { type: 'Customer', id: 102, name: 'Wellness Drug Store' }, createdAt: '2024-07-29T09:00:00Z' }
];

// Investor Mock Data
export const INVESTOR_TRANSACTIONS: InvestorTransaction[] = [
    { id: 1, investorId: 301, type: 'INVESTMENT', amount: 250000, date: '2024-05-15', notes: 'Initial seed investment' },
    { id: 2, investorId: 301, type: 'INVESTMENT', amount: 100000, date: '2024-07-20', notes: 'Additional capital for Q3 purchases' },
    { id: 3, investorId: 301, type: 'PAYOUT', amount: 15000, date: '2024-08-01', notes: 'Q2 2024 Return' },
    { id: 4, investorId: 301, type: 'PROFIT_SHARE', amount: 2500, date: '2024-08-10', notes: 'Profit share from PI-2024-056', relatedPurchaseInvoiceId: 'pi-2' }
];