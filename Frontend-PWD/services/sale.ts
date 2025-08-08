import { Order, SaleReturn } from '../types';

const API_BASE = 'http://127.0.0.1:8000/sales';

export async function listSaleInvoices(): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/invoices/`);
    if (!res.ok) throw new Error('Failed to fetch sale invoices');
    return res.json();
}

export async function createSaleInvoice(invoice: Partial<Order>): Promise<Order> {
    const payload = {
        invoice_no: invoice.invoiceNo,
        company_invoice_number: invoice.companyInvoiceNumber,
        date: invoice.date,
        customer: invoice.customerId ?? invoice.customer?.id,
        warehouse: invoice.warehouseId,
        salesman: invoice.salesmanId,
        booking_man_id: invoice.bookingManId,
        supplying_man_id: invoice.supplyingManId,
        delivery_man_id: invoice.deliveryManId,
        city_id: invoice.cityId,
        area_id: invoice.areaId,
        sub_total: invoice.subTotal,
        discount: invoice.discount,
        tax: invoice.tax,
        grand_total: invoice.grandTotal,
        paid_amount: invoice.paidAmount,
        net_amount: invoice.netAmount ?? invoice.grandTotal,
        payment_method: invoice.paymentMethod,
        status: invoice.status,
        qr_code: invoice.qrCode,
        items: (invoice.items || []).map(it => ({
            product: it.productId,
            batch: it.batchId,
            quantity: it.quantity,
            bonus: it.bonus,
            packing: it.packing || 0,
            rate: it.rate,
            discount1: it.discount1,
            discount2: it.discount2,
            amount: it.amount,
            net_amount: it.netAmount,
        })),
    };
    const res = await fetch(`${API_BASE}/invoices/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create sale invoice');
    return res.json();
}

export async function createSaleReturn(data: Partial<SaleReturn>): Promise<SaleReturn> {
    const payload = {
        return_no: data.returnNo,
        date: data.date,
        customer: data.customer?.id ?? data.customer,
        warehouse: data.warehouseId,
        total_amount: data.totalAmount,
        items: (data.items || []).map(it => ({
            product: it.productId,
            batch_number: it.batchNo,
            expiry_date: it.expiryDate,
            quantity: it.quantity,
            rate: it.rate,
            discount1: it.discount1 ?? 0,
            discount2: it.discount2 ?? 0,
            amount: it.amount,
            net_amount: it.netAmount ?? it.amount,
        })),
    };
    const res = await fetch(`${API_BASE}/returns/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create sale return');
    return res.json();
}
