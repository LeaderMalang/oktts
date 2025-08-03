from django.contrib import admin
from .models import PurchaseInvoice, PurchaseInvoiceItem, PurchaseReturn, PurchaseReturnItem

class PurchaseInvoiceItemInline(admin.TabularInline):
    model = PurchaseInvoiceItem
    extra = 1

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
    readonly_fields = ('voucher',)

    # def save_model(self, request, obj, form, change):
    #     obj.total_amount = sum([item.amount for item in obj.items.all()])
    #     super().save_model(request, obj, form, change)

class PurchaseReturnItemInline(admin.TabularInline):
    model = PurchaseReturnItem
    extra = 1

class PurchaseReturnAdmin(admin.ModelAdmin):
    list_display = ('return_no', 'date', 'supplier', 'warehouse', 'total_amount')
    list_filter = ('warehouse', 'supplier')
    search_fields = ('return_no', 'supplier__name')
    inlines = [PurchaseReturnItemInline]
    readonly_fields = ('voucher',)

    # def save_model(self, request, obj, form, change):
    #     obj.total_amount = sum([item.amount for item in obj.items.all()])
    #     super().save_model(request, obj, form, change)

admin.site.register(PurchaseInvoice, PurchaseInvoiceAdmin)
admin.site.register(PurchaseReturn, PurchaseReturnAdmin)
