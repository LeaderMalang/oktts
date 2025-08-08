import { PriceList, PriceListItem } from '../types';

const API_BASE = 'http://127.0.0.1:8000/api/pricing';

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
  if (res.status === 204) {
    return {} as T;
  }
  return res.json();
}

export const getPriceLists = () =>
  request<PriceList[]>(`${API_BASE}/pricelists/`);

export const createPriceList = (data: Partial<PriceList>) =>
  request<PriceList>(`${API_BASE}/pricelists/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updatePriceList = (id: number, data: Partial<PriceList>) =>
  request<PriceList>(`${API_BASE}/pricelists/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deletePriceList = (id: number) =>
  request<void>(`${API_BASE}/pricelists/${id}/`, { method: 'DELETE' });

export const getPriceListItems = (priceListId?: number) => {
  const url = priceListId
    ? `${API_BASE}/pricelist-items/?price_list=${priceListId}`
    : `${API_BASE}/pricelist-items/`;
  return request<PriceListItem[]>(url);
};

export const createPriceListItem = (data: Partial<PriceListItem>) => {
  const payload = {
    price_list: data.priceListId,
    product: data.productId,
    price: data.price,
    description: data.description,
  };
  return request<PriceListItem>(`${API_BASE}/pricelist-items/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updatePriceListItem = (id: number, data: Partial<PriceListItem>) => {
  const payload = {
    price_list: data.priceListId,
    product: data.productId,
    price: data.price,
    description: data.description,
  };
  return request<PriceListItem>(`${API_BASE}/pricelist-items/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const deletePriceListItem = (id: number) =>
  request<void>(`${API_BASE}/pricelist-items/${id}/`, { method: 'DELETE' });

