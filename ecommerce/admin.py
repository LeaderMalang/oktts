from django.contrib import admin
from django import forms
from django.contrib.admin.helpers import ActionForm

from .models import Order, OrderItem
from setting.models import Warehouse
from sale.models import SaleInvoice


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    inlines = [OrderItemInline]
    list_display = ["order_no", "customer", "date", "status", "total_amount"]
    actions = ["confirm_orders"]

    class ConfirmOrderActionForm(ActionForm):
        warehouse = forms.ModelChoiceField(
            queryset=Warehouse.objects.all(), required=False
        )
        payment_method = forms.ChoiceField(
            choices=SaleInvoice.PAYMENT_CHOICES, required=False
        )

    action_form = ConfirmOrderActionForm

    @admin.action(description="Confirm selected orders")
    def confirm_orders(self, request, queryset):
        form = self.action_form(request.POST)
        if form.is_valid():
            warehouse = (
                form.cleaned_data.get("warehouse")
                or Warehouse.objects.first()
            )
            payment_method = (
                form.cleaned_data.get("payment_method")
                or SaleInvoice.PAYMENT_CHOICES[0][0]
            )
            for order in queryset:
                order.confirm(
                    warehouse=warehouse, payment_method=payment_method
                )
