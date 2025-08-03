from django import forms
from django.forms.models import inlineformset_factory
from .models import SaleInvoice, SaleInvoiceItem


class SaleInvoiceForm(forms.ModelForm):
    class Meta:
        model = SaleInvoice
        fields = (
            'invoice_no',
            'date',
            'customer',
            'warehouse',
            'salesman',
            'city_id',
            'area_id',
            'supplying_staff',
            'booking_staff',
            'delivery_staff',
            'total_amount',
            'discount',
            'net_amount',
            'tax',
            'payment_method',
            'payment_details',
            'qr_code',
            'status',
        )


SaleInvoiceItemForm = inlineformset_factory(
    SaleInvoice,
    SaleInvoiceItem,
    fields=(
        'product',
        'batch',
        'quantity',
        'bonus',
        'packing',
        'rate',
        'discount1',
        'discount2',
        'amount',
        'net_amount',
    ),
    extra=1,
    can_delete=True,
)

