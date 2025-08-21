# OKTTS

## POS and voucher integration

Point of Sale (POS) submissions reuse the existing sale invoice API at `/sales/invoices/`.  
The `SaleInvoice` model automatically creates and links a `Voucher` when an invoice is saved, ensuring each POS-generated invoice has a corresponding accounting entry.

A regression test at `sale/tests.py` verifies that a voucher is attached whenever an invoice is created via the API.

## Ecommerce orders

Retrieve all orders for a specific customer via:

```
GET /ecommerce/orders/customer/<customer_id>/
```

This endpoint returns a list of orders belonging to the given customer.
