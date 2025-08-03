from django import forms
from django.forms.models import inlineformset_factory
from .models import SaleInvoice,SaleInvoiceItem


class SaleInvoiceForm(forms.ModelForm):
    class Meta:
        model=SaleInvoice
        fields=('invoice_no','date','customer', 'warehouse','salesman','delivery_person','total_amount','discount','net_amount',)




SaleInvoiceItemForm = inlineformset_factory(
    SaleInvoice,
    SaleInvoiceItem,
    fields=('product', 'quantity', 'bonus', 'rate', 'discount'),
    extra=1,
    can_delete=True,
)