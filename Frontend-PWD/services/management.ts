import { PriceListItem } from '../types';

const API_BASE = 'http://127.0.0.1:8000/api/management';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('authToken');
    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Token ${token}` } : {}),
            ...(options.headers || {}),
        },
    });
    if (!res.ok) {
        throw new Error(await res.text());
    }
    return res.json();
}

export const getEntities = <T>(entity: string) =>
    request<T[]>(`${API_BASE}/${entity}/`);

export const createEntity = <T>(entity: string, data: Partial<T>) =>
    request<T>(`${API_BASE}/${entity}/`, {
        method: 'POST',
        body: JSON.stringify(data),
    });

export const updateEntity = <T>(entity: string, id: number, data: Partial<T>) =>
    request<T>(`${API_BASE}/${entity}/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

export const getPriceListItems = (priceListId: number) =>
    request<PriceListItem[]>(`${API_BASE}/price-lists/${priceListId}/items/`);

export const createPriceListItem = (priceListId: number, data: Partial<PriceListItem>) =>
    request<PriceListItem>(`${API_BASE}/price-lists/${priceListId}/items/`, {
        method: 'POST',
        body: JSON.stringify(data),
    });

export const updatePriceListItem = (priceListId: number, id: number, data: Partial<PriceListItem>) =>
    request<PriceListItem>(`${API_BASE}/price-lists/${priceListId}/items/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
