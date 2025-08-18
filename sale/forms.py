from django import forms
from django.forms.models import inlineformset_factory

from .models import SaleInvoice, SaleInvoiceItem


class SaleInvoiceForm(forms.ModelForm):
    class Meta:
        model = SaleInvoice
        fields = (
            'invoice_no',

            'company_invoice_number',

            'date',
            'customer',
            'warehouse',
            'salesman',

            'total_amount',
            'discount',
            'tax',
            'payment_method',
            'paid_amount',
            'status',
        )

    def clean(self):
        cleaned_data = super().clean()
        total = cleaned_data.get('total_amount') or 0
        discount = cleaned_data.get('discount') or 0
        tax = cleaned_data.get('tax') or 0
        grand_total = total - discount + tax
        paid = cleaned_data.get('paid_amount') or 0
        if paid > grand_total:
            self.add_error('paid_amount', 'Paid amount cannot exceed grand total.')
        return cleaned_data


        

SaleInvoiceItemForm = inlineformset_factory(
    SaleInvoice,
    SaleInvoiceItem,
    fields=('product', 'quantity', 'rate', 'amount'),
    extra=1,
    can_delete=True,
)


