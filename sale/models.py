from django.db import models
from setting.models import Warehouse
from inventory.models import Product,Party
from voucher.models import Voucher
# Create your models here.
class SaleInvoice(models.Model):
    invoice_no = models.CharField(max_length=50, unique=True)
    date = models.DateField()
    customer = models.ForeignKey(Party, on_delete=models.CASCADE, limit_choices_to={'party_type': 'customer'})
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)
    salesman = models.ForeignKey('hr.Employee', on_delete=models.SET_NULL, null=True, blank=True, related_name='sales')
    delivery_person = models.ForeignKey('hr.Employee', on_delete=models.SET_NULL, null=True, blank=True, related_name='deliveries')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_amount = models.DecimalField(max_digits=12, decimal_places=2)
    voucher = models.ForeignKey(Voucher, on_delete=models.SET_NULL, null=True, blank=True)


class SaleInvoiceItem(models.Model):
    invoice = models.ForeignKey(SaleInvoice, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    amount = models.DecimalField(max_digits=12, decimal_places=2)

class SaleReturn(models.Model):
    return_no = models.CharField(max_length=50, unique=True)
    date = models.DateField()
    customer = models.ForeignKey(Party, on_delete=models.CASCADE, limit_choices_to={'party_type': 'customer'})
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    voucher = models.ForeignKey(Voucher, on_delete=models.SET_NULL, null=True, blank=True)


class SaleReturnItem(models.Model):
    return_invoice = models.ForeignKey(SaleReturn, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    amount = models.DecimalField(max_digits=12, decimal_places=2)