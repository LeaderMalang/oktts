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

            'booking_man_id',
            'supplying_man_id',
            'delivery_man_id',
            'city_id',
            'area_id',
            'sub_total',
            'tax',
            'qr_code',
            'total_amount',
            'discount',
            'net_amount',

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

