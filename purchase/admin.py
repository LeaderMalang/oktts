from django.contrib import admin
from .models import (
    PurchaseInvoice,
    PurchaseInvoiceItem,
    PurchaseReturn,
    PurchaseReturnItem,
    InvestorTransaction,
)

class PurchaseInvoiceItemInline(admin.TabularInline):
    model = PurchaseInvoiceItem
    extra = 1

class PurchaseInvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_no', 'date', 'supplier', 'warehouse', 'total_amount')
    list_filter = ('warehouse', 'supplier')
    search_fields = ('invoice_no', 'supplier__name')
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


class InvestorTransactionAdmin(admin.ModelAdmin):
    list_display = ("investor", "transaction_type", "amount", "date", "purchase_invoice")
    list_filter = ("transaction_type", "date")
    search_fields = ("investor__name", "notes")


admin.site.register(InvestorTransaction, InvestorTransactionAdmin)
