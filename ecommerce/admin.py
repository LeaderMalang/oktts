from django.contrib import admin
from django import forms

from setting.models import Warehouse
from sale.models import SaleInvoice

from .models import Order, OrderItem


class OrderAdminForm(forms.ModelForm):
    warehouse = forms.ModelChoiceField(queryset=Warehouse.objects.all(), required=False)
    payment_method = forms.ChoiceField(
        choices=SaleInvoice.PAYMENT_CHOICES, required=False, initial="Cash"
    )

    class Meta:
        model = Order
        fields = "__all__"


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    form = OrderAdminForm
    inlines = [OrderItemInline]
    list_display = ["order_no", "customer", "date", "status", "total_amount"]

    def save_model(self, request, obj, form, change):
        previous_status = None
        if change:
            previous_status = Order.objects.get(pk=obj.pk).status
        super().save_model(request, obj, form, change)
        if obj.status == "Confirmed" and previous_status != "Confirmed":
            warehouse = form.cleaned_data.get("warehouse") or Warehouse.objects.first()
            payment_method = form.cleaned_data.get("payment_method") or "Cash"
            if warehouse:
                obj.confirm(warehouse, payment_method)
