from django.contrib import admin
from django import forms
from django.http import HttpResponse
from django.template.loader import render_to_string
from xhtml2pdf import pisa
from django.db import transaction
from .models import (
    PurchaseInvoice,
    PurchaseInvoiceItem,
    PurchaseReturn,
    PurchaseReturnItem,
    InvestorTransaction,
)
from inventory.models import Batch, StockMovement

class PurchaseInvoiceItemForm(forms.ModelForm):
    class Meta:
        model = PurchaseInvoiceItem
        fields = (
            "product",
            "batch_number",
            "expiry_date",
            "quantity",
            "purchase_price",
            "sale_price",
            "amount",
        )
        widgets = {
            "expiry_date": forms.DateInput(attrs={"type": "date"}),
        }

    def clean(self):
        data = super().clean()
        qty = data.get("quantity") or 0
        rate = data.get("purchase_price") or 0
        if qty and rate and not data.get("amount"):
            data["amount"] = qty * rate
        return data


class PurchaseInvoiceItemInline(admin.TabularInline):
    model = PurchaseInvoiceItem
    form = PurchaseInvoiceItemForm
    extra = 1
    autocomplete_fields = ["product"]
    fields = (
        "product",
        "batch_number",
        "expiry_date",
        "quantity",
        "purchase_price",
        "sale_price",
        "amount",
    )


# --- PDF Helper ---

def generate_pdf_invoice(invoice):
    context = {
        'invoice': invoice,
        'items': invoice.items.all() if hasattr(invoice, 'items') else [],
        'invoice_type': invoice.__class__.__name__,
    }
    html = render_to_string("invoices/pdf_invoice.html", context)
    response = HttpResponse(content_type='application/pdf')
    pisa.CreatePDF(html, dest=response)
    return response


# --- Admin Actions ---

def print_invoice_pdf(modeladmin, request, queryset):
    if queryset.count() == 1:
        return generate_pdf_invoice(queryset.first())
    return HttpResponse("Please select only one invoice to print.")


print_invoice_pdf.short_description = "Print Invoice PDF"

class PurchaseInvoiceAdmin(admin.ModelAdmin):
    list_display = (
        'invoice_no',
        'company_invoice_number',
        'date',
        'supplier',
        'warehouse',
        'grand_total',
        'status',
        'payment_method',
    )
    list_filter = ('warehouse', 'supplier', 'status', 'payment_method')
    search_fields = ('invoice_no', 'company_invoice_number', 'supplier__name')
    inlines = [PurchaseInvoiceItemInline]
    readonly_fields = ('journal_entry',)
    actions = [print_invoice_pdf]

    @transaction.atomic
    def save_formset(self, request, form, formset, change):
        """
        After items are saved, ensure each row has a corresponding Batch record
        (per product+batch_number+warehouse) and log StockMovement(IN).
        """
        instances = formset.save(commit=False)
        # mark deleted rows
        for obj in formset.deleted_objects:
            obj.delete()

        invoice: PurchaseInvoice = form.instance

        for item in instances:
            # compute amount if missing
            if item.quantity and item.purchase_price and not item.amount:
                item.amount = item.quantity * item.purchase_price
            item.save()

        # Now batches + stock movements
        for item in instances:
            # Find or create the batch in the current warehouse
            batch, created = Batch.objects.get_or_create(
                product=item.product,
                batch_number=item.batch_number,
                warehouse=invoice.warehouse,
                defaults={
                    "expiry_date": item.expiry_date,
                    "purchase_price": item.purchase_price,
                    "sale_price": item.sale_price or item.purchase_price,
                    "quantity": 0,  # we’ll increment below
                },
            )
            # If batch existed, you may want to update metadata (optional):
            # keep oldest expiry or overwrite — here we overwrite to latest provided
            batch.expiry_date = item.expiry_date
            batch.purchase_price = item.purchase_price
            if item.sale_price:
                batch.sale_price = item.sale_price
            # Increase stock by received qty
            batch.quantity = (batch.quantity or 0) + (item.quantity or 0)
            batch.save()

            # Log stock movement (IN)
            StockMovement.objects.create(
                batch=batch,
                movement_type="IN",
                quantity=item.quantity or 0,
                reason=f"Purchase Invoice {invoice.invoice_no}",
                ref_model="PurchaseInvoice",
                ref_id=invoice.pk,
            )

        # DRF/Model layer auto‑ledger logic runs on invoice.save()
        formset.save_m2m()  # finish

class PurchaseReturnItemInline(admin.TabularInline):
    model = PurchaseReturnItem
    extra = 1

class PurchaseReturnAdmin(admin.ModelAdmin):
    list_display = ('return_no', 'date', 'supplier', 'warehouse', 'total_amount')
    list_filter = ('warehouse', 'supplier')
    search_fields = ('return_no', 'supplier__name')
    inlines = [PurchaseReturnItemInline]
    readonly_fields = ('journal_entry',)
    actions = [print_invoice_pdf]

    # def save_model(self, request, obj, form, change):
    #     obj.total_amount = sum([item.amount for item in obj.items.all()])
    #     super().save_model(request, obj, form, change)

admin.site.register(PurchaseInvoice, PurchaseInvoiceAdmin)
admin.site.register(PurchaseReturn, PurchaseReturnAdmin)


class InvestorTransactionAdmin(admin.ModelAdmin):
    list_display = ("investor", "transaction_type", "amount", "date", "purchase_invoice")
    list_filter = ("transaction_type", "date")
    search_fields = ("investor__name", "notes")


admin.site.register(InvestorTransaction, InvestorTransactionAdmin)
