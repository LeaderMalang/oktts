from django.contrib import admin,messages
from django.utils.html import format_html
from django.http import HttpResponse
from django.template.loader import render_to_string
from xhtml2pdf import pisa
from inventory.models import Batch, StockMovement
from .models import (
    SaleInvoice,
    SaleInvoiceItem,
    SaleReturn,
    SaleReturnItem,
    RecoveryLog,
)
from .forms import SaleReturnAdminForm
from django.urls import reverse
from django.db.models import Sum, F, DecimalField, ExpressionWrapper,Prefetch
from django.utils.translation import gettext_lazy as _
from django import forms
from django.http import JsonResponse, Http404
from django.urls import path
# --- Inlines ---

class SaleInvoiceItemInline(admin.TabularInline):
    model = SaleInvoiceItem
    extra = 1

# class SaleReturnItemInline(admin.TabularInline):
#     model = SaleReturnItem
#     extra = 1
#     fields = ("product", "batch_number", "quantity", "rate", "amount")
#     readonly_fields = ("amount",)
#     autocomplete_fields = ("product",)

#     # Limit products to those sold on the selected invoice
#     def formfield_for_foreignkey(self, db_field, request=None, **kwargs):
#         formfield = super().formfield_for_foreignkey(db_field, request, **kwargs)
#         if db_field.name == "product":
#             parent_obj = getattr(self, "parent_obj", None)
#             if parent_obj and parent_obj.invoice_id:
#                 # products from the original sale’s items
#                 qs = SaleInvoiceItem.objects.filter(
#                     invoice_id=parent_obj.invoice_id
#                 ).values_list("product_id", flat=True)
#                 formfield.queryset = formfield.queryset.filter(pk__in=list(qs))
#         return formfield

#     # Need access to parent obj, set in get_formset
#     def get_formset(self, request, obj=None, **kwargs):
#         self.parent_obj = obj
#         return super().get_formset(request, obj, **kwargs)

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

# --- SaleInvoice Admin ---

@admin.register(SaleInvoice)
class SaleInvoiceAdmin(admin.ModelAdmin):

    list_display = ['invoice_no', 'date', 'customer', 'warehouse', 'sub_total', 'tax', 'total_amount', 'net_amount']
    list_filter = ['date', 'warehouse','booking_man_id', 'delivery_man_id', 'city_id', 'area_id']

    search_fields = ['invoice_no', 'customer__name']
    inlines = [SaleInvoiceItemInline]
    actions = [print_invoice_pdf]

    readonly_fields = ['total_amount', 'net_amount']

# ---------- Inline ----------
class SaleReturnItemInline(admin.TabularInline):
    model = SaleReturnItem
    extra = 0  # we’ll add rows via JS
    # autocomplete_fields = ('product',)  # if you enabled it
    fields = ('product', 'batch_number',"expiry_date" ,'quantity', 'rate', 'amount')
    readonly_fields = ()
    can_delete = True


# ---------- Form ----------
class SaleReturnForm(forms.ModelForm):
    class Meta:
        model = SaleReturn
        fields = (
            'return_no', 'date', 'invoice', 'customer', 'warehouse',
            'payment_method', 'total_amount'
        )

    class Media:
        # collectstatic -> make sure these exist in your static dirs
        js = ('admin/sale_return_autofill.js',)


# ---------- Sale Return Admin ----------

@admin.register(SaleReturn)
class SaleReturnAdmin(admin.ModelAdmin):
    form = SaleReturnForm
    inlines = [SaleReturnItemInline]

    list_display = ('return_no', 'date', 'customer', 'warehouse', 'payment_method', 'total_amount')
    list_filter  = ('date', 'warehouse', 'payment_method')
    search_fields = ('return_no', 'customer__name')
    actions = [print_invoice_pdf]
    # --------- server-side defaults when opening Add with ?invoice=ID -----------
    def get_changeform_initial_data(self, request):
        initial = super().get_changeform_initial_data(request)
        inv_id = request.GET.get('invoice')
        if inv_id:
            try:
                inv = (SaleInvoice.objects
                       .select_related('customer', 'warehouse')
                       .get(pk=inv_id))
                initial.update({
                    'invoice': inv.pk,
                    'customer': inv.customer_id,
                    'warehouse': inv.warehouse_id,
                    'payment_method': inv.payment_method,
                })
            except SaleInvoice.DoesNotExist:
                pass
        return initial

    # --------- AJAX endpoint to fetch invoice + lines -----------
    def get_urls(self):
        return [
            path(
                'ajax/invoice/<int:pk>/',
                self.admin_site.admin_view(self.ajax_invoice),
                name='sale_return_invoice_json',
            ),
        ] + super().get_urls()

    def ajax_invoice(self, request, pk: int):
        try:
            inv = (
                SaleInvoice.objects
                .select_related("customer", "warehouse")
                .prefetch_related(
                    Prefetch(
                        "items",
                        queryset=SaleInvoiceItem.objects.select_related("product","batch")
                    )
                )
                .get(pk=pk)
            )
        except SaleInvoice.DoesNotExist:
            raise Http404("Invoice not found")

        items_payload = []
        for line in inv.items.all():
            batch_obj = None
            product_id = None

            # --- Try schema A: product IS a Batch ---
            if isinstance(line.batch, Batch):
                batch_obj = line.batch
                product_id = batch_obj.product_id

            # --- Try schema B: product is Product + batch fields on item ---
            # elif hasattr(line, "product_id") and line.product_id:
            #     product_id = line.product_id
            #     # If item has batch_number/expiry_date fields, resolve a Batch (if exists)
            #     batch_no = getattr(line, "batch_number", None)
            #     if batch_no:
            #         batch_obj = (
            #             Batch.objects
            #             .filter(product_id=product_id, batch_number=batch_no)
            #             .order_by("-expiry_date")
            #             .first()
            #         )

            # Fallback values
            rate = (
                getattr(line, "rate", None)
                or getattr(line, "price", None)
                or (batch_obj.sale_price if batch_obj else None)
                or 0
            )
            qty = float(getattr(line, "quantity", 0) or 0)
            amount = float(rate) * qty

            items_payload.append({
                "product": product_id,
                # "product_name": str(getattr(line.product, "product", getattr(line, "product", ""))) if isinstance(line.product, Batch) else str(getattr(line, "product", "")),
                "batch_id": batch_obj.id if batch_obj else None,
                "batch_number": batch_obj.batch_number if batch_obj else getattr(line, "batch_number", "") or "",
                "expiry_date": (
                    batch_obj.expiry_date.isoformat() if batch_obj and batch_obj.expiry_date
                    else (getattr(line, "expiry_date", None).isoformat() if getattr(line, "expiry_date", None) else None)
                ),
                "quantity": qty,
                "rate": float(rate),
                "amount": amount,
            })

        data = {
            "invoice_id": inv.id,
            "invoice_no": inv.invoice_no,
            "customer": {"id": inv.customer_id, "name": str(inv.customer)},
            "warehouse": {"id": inv.warehouse_id, "name": str(inv.warehouse)},
            "payment_method": inv.payment_method,
            "items": items_payload,
            "totals": {
                "sub_total": float(inv.sub_total or 0),
                "discount": float(inv.discount or 0),
                "tax": float(inv.tax or 0),
                "grand_total": float(inv.grand_total or 0),
                "paid_amount": float(inv.paid_amount or 0),
                "net_amount": float(inv.net_amount or 0),
            },
        }
        return JsonResponse(data, safe=False)

    # --------- recalc total on save -----------
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        # After inlines saved, recompute total from items
        total = obj.items.aggregate(
            s=Sum(F('quantity') * F('rate'))
        )['s'] or 0
        obj.total_amount = total
        obj.save(update_fields=['total_amount'])
        messages.success(request, _("Total updated from items: %s") % total)







@admin.register(RecoveryLog)
class RecoveryLogAdmin(admin.ModelAdmin):
    list_display = ['invoice', 'employee', 'notes', 'date']
    list_filter = ['date', 'employee']
