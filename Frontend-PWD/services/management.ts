
import { ChartOfAccount, Party, PriceList, PriceListItem, Product } from '../types';

const MANAGEMENT_API_BASE = 'http://127.0.0.1:8000/management';
const INVENTORY_API_BASE = 'http://127.0.0.1:8000/inventory';
const SALE_API_BASE = 'http://127.0.0.1:8000/sales';
const VOUCHER_API_BASE = 'http://127.0.0.1:8000/voucher';
const PRICING_API_BASE = 'http://127.0.0.1:8000/pricing';


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
    request<T[]>(`${MANAGEMENT_API_BASE}/${entity}/`);

export const createEntity = <T>(entity: string, data: Partial<T>) => {
    console.log(entity, data);

    request<T>(`${MANAGEMENT_API_BASE}/${entity}/`, {


        method: 'POST',
        body: JSON.stringify(data),
    });
};
    

export const updateEntity = <T>(entity: string, id: number, data: Partial<T>) =>
    request<T>(`${MANAGEMENT_API_BASE}/${entity}/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });


export const getProducts = () =>
    request<Product[]>(`${INVENTORY_API_BASE}/products/`);

export const getParties = () =>
    request<Party[]>(`${SALE_API_BASE}/parties/`);

export const getAccounts = () =>
    request<ChartOfAccount[]>(`${VOUCHER_API_BASE}/accounts/`);

export const getPriceLists = () =>
    request<PriceList[]>(`${PRICING_API_BASE}/pricelists/`);

export const getPriceListItems = (priceListId: number) =>
    request<PriceListItem[]>(`${PRICING_API_BASE}/pricelists/${priceListId}/items/`);

export const createPriceListItem = (priceListId: number, data: Partial<PriceListItem>) =>
    request<PriceListItem>(`${PRICING_API_BASE}/pricelists/${priceListId}/items/`, {
        method: 'POST',
        body: JSON.stringify(data),
    });

export const updatePriceListItem = (priceListId: number, id: number, data: Partial<PriceListItem>) =>
    request<PriceListItem>(`${PRICING_API_BASE}/pricelists/${priceListId}/items/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

