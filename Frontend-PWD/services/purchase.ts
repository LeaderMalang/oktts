import { PurchaseInvoice, PurchaseReturn, InvestorTransaction } from '../types';

const API_BASE = 'http://127.0.0.1:8000/purchase';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return res.json();
}

// Purchase Invoices
export const fetchPurchaseInvoices = () => request<PurchaseInvoice[]>(`${API_BASE}/invoices/`);
export const createPurchaseInvoice = (data: Partial<PurchaseInvoice>) =>
  request<PurchaseInvoice>(`${API_BASE}/invoices/`, { method: 'POST', body: JSON.stringify(data) });
export const updatePurchaseInvoice = (id: number | string, data: Partial<PurchaseInvoice>) =>
  request<PurchaseInvoice>(`${API_BASE}/invoices/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePurchaseInvoice = (id: number | string) =>
  request<void>(`${API_BASE}/invoices/${id}/`, { method: 'DELETE' });

// Purchase Returns
export const fetchPurchaseReturns = () => request<PurchaseReturn[]>(`${API_BASE}/returns/`);
export const createPurchaseReturn = (data: Partial<PurchaseReturn>) =>
  request<PurchaseReturn>(`${API_BASE}/returns/`, { method: 'POST', body: JSON.stringify(data) });
export const updatePurchaseReturn = (id: number | string, data: Partial<PurchaseReturn>) =>
  request<PurchaseReturn>(`${API_BASE}/returns/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePurchaseReturn = (id: number | string) =>
  request<void>(`${API_BASE}/returns/${id}/`, { method: 'DELETE' });

// Investor Transactions
export const fetchInvestorTransactions = () => request<InvestorTransaction[]>(`${API_BASE}/investor-transactions/`);
export const createInvestorTransaction = (data: Partial<InvestorTransaction>) =>
  request<InvestorTransaction>(`${API_BASE}/investor-transactions/`, { method: 'POST', body: JSON.stringify(data) });
export const updateInvestorTransaction = (id: number | string, data: Partial<InvestorTransaction>) =>
  request<InvestorTransaction>(`${API_BASE}/investor-transactions/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteInvestorTransaction = (id: number | string) =>
  request<void>(`${API_BASE}/investor-transactions/${id}/`, { method: 'DELETE' });
