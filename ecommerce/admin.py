from django.contrib import admin
from django import forms

from django.contrib.admin.helpers import ActionForm




from .models import Order, OrderItem
from setting.models import Warehouse
from sale.models import SaleInvoice
from finance.models import PaymentTerm

class OrderAdminForm(forms.ModelForm):
    warehouse = forms.ModelChoiceField(queryset=Warehouse.objects.all(), required=False)
    payment_method = forms.ChoiceField(
        choices=SaleInvoice.PAYMENT_CHOICES, required=False, initial="Cash"
    )
    payment_terms = forms.ModelChoiceField(queryset=PaymentTerm.objects.all(), required=False)
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
    list_display = ["order_no", "customer", "date", "status", "total_amount","paid_amount"]

    actions = ["confirm_orders"]

    class ConfirmOrderActionForm(ActionForm):
        warehouse = forms.ModelChoiceField(
            queryset=Warehouse.objects.all(), required=False
        )
        payment_method = forms.ChoiceField(
            choices=SaleInvoice.PAYMENT_CHOICES, required=False
        )
        payment_terms = forms.ModelChoiceField(queryset=PaymentTerm.objects.all(), required=False)

    action_form = ConfirmOrderActionForm

    @admin.action(description="Confirm selected orders")
    def confirm_orders(self, request, queryset):
        form = self.action_form(request.POST)
        warehouse = ( Warehouse.objects.get(id=form.data.get("warehouse"))
                      or Warehouse.objects.first()
                    )
        payment_terms = ( PaymentTerm.objects.get(id=form.data.get("payment_terms"))
                      or None
                    )
        payment_method = (
                form.data.get("payment_method")
                or SaleInvoice.PAYMENT_CHOICES[0][0]
            )
        for order in queryset:
            order.confirm(
                    warehouse=warehouse, payment_method=payment_method,payment_terms=payment_terms
            )
        # if form.is_valid():
            


    def save_model(self, request, obj, form, change):
        previous_status = None
        if change:
            previous_status = Order.objects.get(pk=obj.pk).status
        super().save_model(request, obj, form, change)
        if obj.status == "Confirmed" and previous_status != "Confirmed":
            warehouse = form.cleaned_data.get("warehouse") or Warehouse.objects.first()
            payment_method = form.cleaned_data.get("payment_method") or "Cash"
            payment_terms = form.cleaned_data.get("payment_terms")
            if warehouse:
                obj.confirm(warehouse, payment_method,payment_terms)

