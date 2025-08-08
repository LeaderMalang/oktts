
import { Product, Batch, Party, PriceListItem } from '../types';


const API_BASE = 'http://127.0.0.1:8000/inventory';

async function request<T>(url: string): Promise<T> {

  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return res.json();
}


export const fetchProducts = async (): Promise<Product[]> => {
  const data = await request<any[]>(`${API_BASE}/products/`);
  return data.map(p => ({
    id: p.id,
    name: p.name,
    barcode: p.barcode,
    companyId: p.company ?? p.company_id,
    groupId: p.group ?? p.group_id,
    distributorId: p.distributor ?? p.distributor_id,
    tradePrice: parseFloat(p.trade_price ?? p.tradePrice ?? 0),
    retailPrice: parseFloat(p.retail_price ?? p.retailPrice ?? 0),
    salesTaxRatio: parseFloat(p.sales_tax_ratio ?? p.salesTaxRatio ?? 0),
    fedTaxRatio: parseFloat(p.fed_tax_ratio ?? p.fedTaxRatio ?? 0),
    disableSalePurchase: p.disable_sale_purchase ?? p.disableSalePurchase ?? false,
    stock: p.stock ?? 0,
  }));
};

export const fetchBatches = async (): Promise<Batch[]> => {
  const data = await request<any[]>(`${API_BASE}/batches/`);
  return data.map(b => ({
    id: b.id,
    productId: b.product ?? b.product_id,
    batchNo: b.batch_number ?? b.batchNo,
    expiryDate: b.expiry_date ?? b.expiryDate,
    rate: parseFloat(b.rate ?? b.sale_price ?? b.salePrice ?? 0),
    stock: b.stock ?? b.quantity ?? 0,
  }));
};

export const fetchCustomers = async (): Promise<Party[]> => {
  const data = await request<any[]>(`${API_BASE}/parties/?party_type=customer`);
  return data.map(p => ({
    id: p.id,
    name: p.name,
    address: p.address ?? '',
    phone: p.phone ?? '',
    partyType: p.party_type ?? p.partyType ?? 'customer',
    cityId: p.city ?? p.city_id ?? undefined,
    areaId: p.area ?? p.area_id ?? undefined,
    proprietor: p.proprietor,
    licenseNo: p.license_no,
    licenseExpiry: p.license_expiry,
    category: p.category,
    latitude: p.latitude,
    longitude: p.longitude,
    creditLimit: parseFloat(p.credit_limit ?? 0),
    currentBalance: parseFloat(p.current_balance ?? 0),
    priceListId: p.price_list_id ?? p.price_list ?? null,
  }));
};

export const fetchPriceListItems = async (priceListId: number): Promise<PriceListItem[]> => {
  const data = await request<any>(`${API_BASE}/price-lists/${priceListId}/`);
  return (data.items || []).map((it: any, idx: number) => ({
    id: it.id ?? idx,
    priceListId: priceListId,
    productId: it.product_id ?? it.product__id ?? it.product ?? 0,
    customPrice: parseFloat(it.custom_price ?? it.customPrice ?? 0),
  }));
};

export const fetchParties = () => request<Party[]>(`${API_BASE}/parties/`);

