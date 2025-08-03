from django.contrib import admin
from django.utils.html import format_html
from django.http import HttpResponse
from django.template.loader import render_to_string
from xhtml2pdf import pisa
from inventory.models import Batch, StockMovement
from .models import SaleInvoice, SaleInvoiceItem, SaleReturn, SaleReturnItem

# --- Inlines ---

class SaleInvoiceItemInline(admin.TabularInline):
    model = SaleInvoiceItem
    extra = 1

class SaleReturnItemInline(admin.TabularInline):
    model = SaleReturnItem
    extra = 1

# --- PDF Helper ---

def generate_pdf_invoice(invoice):
    context = {'invoice': invoice}
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

# --- SaleInvoice Admin ---

@admin.register(SaleInvoice)
class SaleInvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_no', 'date', 'customer', 'warehouse', 'total_amount', 'net_amount']
    list_filter = ['date', 'warehouse', 'salesman', 'delivery_person']
    search_fields = ['invoice_no', 'customer__name']
    inlines = [SaleInvoiceItemInline]
    actions = [print_invoice_pdf]

    readonly_fields = ['total_amount', 'net_amount']

    # def save_model(self, request, obj, form, change):
    #     is_new = self.pk is None
    #     if is_new:
    #         for item in self.items.all():
    #             batch = Batch.objects.filter(product=item.product, quantity__gte=item.quantity).order_by('expiry_date').first()
    #             if batch:
    #                 batch.quantity -= item.quantity
    #                 batch.save()
    #                 StockMovement.objects.create(
    #                     batch=batch,
    #                     movement_type='OUT',
    #                     quantity=item.quantity,
    #                     reason=f"Sale Invoice {self.invoice_no}"
    #                 )
        # Auto calculate totals
        # total = sum(item.quantity * item.rate for item in obj.items.all())
        # obj.total_amount = total
        # obj.net_amount = total - obj.discount
        # super().save_model(request, obj, form, change)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('customer', 'salesman', 'delivery_person')

# --- SaleReturn Admin ---

@admin.register(SaleReturn)
class SaleReturnAdmin(admin.ModelAdmin):
    list_display = ['return_no', 'date', 'customer', 'warehouse', 'total_amount']
    list_filter = ['date', 'warehouse']
    search_fields = ['return_no', 'customer__name']
    inlines = [SaleReturnItemInline]
