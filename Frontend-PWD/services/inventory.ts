import { Product, Party } from '../types';

const API_BASE = 'http://127.0.0.1:8000/inventory';

async function request<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return res.json();
}

export const getProducts = () => request<Product[]>(`${API_BASE}/products/`);
export const getParties = () => request<Party[]>(`${API_BASE}/parties/`);
