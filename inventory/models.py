from django.db import models
from setting.models import Company,Group,Distributor
# Create your models here.

class Product(models.Model):
    name = models.CharField(max_length=255)
    barcode = models.CharField(max_length=100, blank=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    distributor = models.ForeignKey(Distributor, on_delete=models.CASCADE)
    trade_price = models.DecimalField(max_digits=10, decimal_places=2)
    retail_price = models.DecimalField(max_digits=10, decimal_places=2)
    sales_tax_ratio = models.DecimalField(max_digits=5, decimal_places=2)
    fed_tax_ratio = models.DecimalField(max_digits=5, decimal_places=2)
    name = models.CharField(max_length=255)
    barcode = models.CharField(max_length=100, blank=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    distributor = models.ForeignKey(Distributor, on_delete=models.CASCADE)
    trade_price = models.DecimalField(max_digits=10, decimal_places=2)
    retail_price = models.DecimalField(max_digits=10, decimal_places=2)
    sales_tax_ratio = models.DecimalField(max_digits=5, decimal_places=2)
    fed_tax_ratio = models.DecimalField(max_digits=5, decimal_places=2)
    disable_sale_purchase = models.BooleanField(default=False)

class Party(models.Model):
    PARTY_TYPES = (('customer', 'Customer'), ('supplier', 'Supplier'))
    name = models.CharField(max_length=255)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    party_type = models.CharField(max_length=10, choices=PARTY_TYPES)