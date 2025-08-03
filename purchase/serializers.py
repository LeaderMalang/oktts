from rest_framework import serializers
from .models import PurchaseInvoice, PurchaseInvoiceItem


class PurchaseInvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseInvoiceItem
        fields = [
            'id', 'product', 'batch_number', 'expiry_date', 'quantity',
            'bonus', 'purchase_price', 'sale_price', 'discount',
            'amount', 'net_amount'
        ]
        read_only_fields = ['amount', 'net_amount']

    def validate(self, attrs):
        quantity = attrs.get('quantity', 0)
        price = attrs.get('purchase_price', 0)
        discount = attrs.get('discount', 0)
        attrs['amount'] = quantity * price
        attrs['net_amount'] = attrs['amount'] - discount
        return attrs


class PurchaseInvoiceSerializer(serializers.ModelSerializer):
    items = PurchaseInvoiceItemSerializer(many=True)

    class Meta:
        model = PurchaseInvoice
        fields = [
            'id', 'invoice_no', 'date', 'supplier', 'warehouse',
            'total_amount', 'items'
        ]
        read_only_fields = ['total_amount']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        invoice = PurchaseInvoice.objects.create(**validated_data)
        for item_data in items_data:
            PurchaseInvoiceItem.objects.create(invoice=invoice, **item_data)
        invoice.update_totals()
        return invoice

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        instance.items.all().delete()
        for item_data in items_data:
            PurchaseInvoiceItem.objects.create(invoice=instance, **item_data)
        instance.update_totals()
        return instance
