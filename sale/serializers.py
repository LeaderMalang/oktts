from rest_framework import serializers

from .models import SaleInvoice, SaleInvoiceItem


class SaleInvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleInvoiceItem
        fields = ['product', 'quantity', 'rate', 'amount']


class SaleInvoiceSerializer(serializers.ModelSerializer):
    items = SaleInvoiceItemSerializer(many=True, read_only=True)

    class Meta:
        model = SaleInvoice
        fields = [
            'id',
            'invoice_no',
            'company_invoice_number',
            'date',
            'customer',
            'warehouse',
            'salesman',
            'delivery_person',
            'investor',
            'total_amount',
            'discount',
            'tax',
            'grand_total',
            'payment_method',
            'paid_amount',
            'status',
            'items',
        ]

    def validate(self, data):
        total = data.get('total_amount') or 0
        discount = data.get('discount') or 0
        tax = data.get('tax') or 0
        grand_total = data.get('grand_total') or 0
        expected_grand_total = total - discount + tax
        if grand_total != expected_grand_total:
            raise serializers.ValidationError({'grand_total': 'Grand total must equal total minus discount plus tax.'})

        paid = data.get('paid_amount') or 0
        if paid > grand_total:
            raise serializers.ValidationError({'paid_amount': 'Paid amount cannot exceed grand total.'})
        return data

