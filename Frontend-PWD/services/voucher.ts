import { ChartOfAccount } from '../types';

const API_BASE = 'http://127.0.0.1:8000/api/voucher';

async function request<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return res.json();
}

export const fetchChartOfAccounts = () =>
  request<ChartOfAccount[]>(`${API_BASE}/chart-of-accounts/`);
