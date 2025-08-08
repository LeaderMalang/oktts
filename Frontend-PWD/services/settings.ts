import { City, Area } from '../types';

const API_BASE = 'http://127.0.0.1:8000/settings';

async function request<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return res.json();
}

export const fetchCities = () => request<City[]>(`${API_BASE}/cities/`);
export const fetchAreas = () => request<Area[]>(`${API_BASE}/areas/`);
