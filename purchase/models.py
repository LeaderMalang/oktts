from django.db import models
from inventory.models import Product,Party
from setting.models import Warehouse
# Create your models here.
class PurchaseInvoice(models.Model):
    invoice_no = models.CharField(max_length=50, unique=True)
    date = models.DateField()
    supplier = models.ForeignKey(Party, on_delete=models.CASCADE, limit_choices_to={'party_type': 'supplier'})
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)

class PurchaseInvoiceItem(models.Model):
    invoice = models.ForeignKey(PurchaseInvoice, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    amount = models.DecimalField(max_digits=12, decimal_places=2)

class PurchaseReturn(models.Model):
    return_no = models.CharField(max_length=50, unique=True)
    date = models.DateField()
    supplier = models.ForeignKey(Party, on_delete=models.CASCADE, limit_choices_to={'party_type': 'supplier'})
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)

class PurchaseReturnItem(models.Model):
    return_invoice = models.ForeignKey(PurchaseReturn, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    amount = models.DecimalField(max_digits=12, decimal_places=2)