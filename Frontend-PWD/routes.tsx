import { Page } from './types';

export interface RouteMeta {
  path: string;
  title: string;
}

export const ROUTES: Record<Page, RouteMeta> = {
  dashboard: { path: '/dashboard', title: 'Dashboard' },
  'recovery-officer-dashboard': { path: '/recovery-officer-dashboard', title: 'Recovery Dashboard' },
  'investor-dashboard': { path: '/investor-dashboard', title: 'Investor Dashboard' },
  investors: { path: '/investors', title: 'Investor Management' },
  'investor-ledger': { path: '/investor-ledger', title: 'Investor Ledger' },
  'credit-recovery': { path: '/credit-recovery', title: 'Credit Recovery' },
  'order-management': { path: '/order-management', title: 'Sale Invoices' },
  'order-detail': { path: '/order-detail', title: 'Order Details' },
  'my-orders': { path: '/my-orders', title: 'My Orders' },
  'new-sale-invoice': { path: '/new-sale-invoice', title: 'Create Sale Invoice' },
  pos: { path: '/pos', title: 'Point of Sale' },
  'new-purchase-invoice': { path: '/new-purchase-invoice', title: 'Create Purchase Invoice' },
  'purchase-invoices': { path: '/purchase-invoices', title: 'Purchase Invoices' },
  'new-sale-return': { path: '/new-sale-return', title: 'Create Sale Return' },
  'sale-returns': { path: '/sale-returns', title: 'Sale Returns' },
  'new-purchase-return': { path: '/new-purchase-return', title: 'Create Purchase Return' },
  'purchase-returns': { path: '/purchase-returns', title: 'Purchase Returns' },
  reports: { path: '/reports', title: 'Reports & Analytics' },
  inventory: { path: '/inventory', title: 'Inventory Management' },
  'stock-audit': { path: '/stock-audit', title: 'Physical Stock Audit' },
  hr: { path: '/hr', title: 'HR Management' },
  'payroll-slips': { path: '/payroll-slips', title: 'Payroll Slips' },
  crm: { path: '/crm', title: 'Customer Relationship Management' },
  tasks: { path: '/tasks', title: 'Task Management' },
  management: { path: '/management', title: 'System Management' },
  expenses: { path: '/expenses', title: 'Expense Management' },
  'my-leave': { path: '/my-leave', title: 'My Leave Requests' },
  ledger: { path: '/ledger', title: 'Customer Ledger' },
  login: { path: '/login', title: 'Login' },
  register: { path: '/register', title: 'Register' },
};

export default ROUTES;
