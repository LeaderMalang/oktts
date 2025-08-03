from rest_framework import serializers
from .models import SaleInvoice, SaleInvoiceItem


class SaleInvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleInvoiceItem
        fields = [
            'id', 'product', 'batch', 'quantity', 'bonus', 'rate',
            'discount', 'amount', 'net_amount'
        ]
        read_only_fields = ['amount', 'net_amount']

    def validate(self, attrs):
        quantity = attrs.get('quantity', 0)
        rate = attrs.get('rate', 0)
        discount = attrs.get('discount', 0)
        attrs['amount'] = quantity * rate
        attrs['net_amount'] = attrs['amount'] - discount
        return attrs


class SaleInvoiceSerializer(serializers.ModelSerializer):
    items = SaleInvoiceItemSerializer(many=True)

    class Meta:
        model = SaleInvoice
        fields = [
            'id', 'invoice_no', 'date', 'customer', 'warehouse',
            'salesman', 'delivery_person', 'discount', 'total_amount',
            'net_amount', 'items'
        ]
        read_only_fields = ['total_amount', 'net_amount']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        invoice = SaleInvoice.objects.create(**validated_data)
        for item_data in items_data:
            SaleInvoiceItem.objects.create(invoice=invoice, **item_data)
        invoice.update_totals()
        return invoice

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        instance.items.all().delete()
        for item_data in items_data:
            SaleInvoiceItem.objects.create(invoice=instance, **item_data)
        instance.update_totals()
        return instance
