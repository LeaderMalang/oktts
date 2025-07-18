from django.db import models
from setting.models import Company, Group, Distributor

# Master Product
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
    disable_sale_purchase = models.BooleanField(default=False)

    def __str__(self):
        return self.name


# Batch per product
class Batch(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    batch_number = models.CharField(max_length=100)
    expiry_date = models.DateField()
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()
    warehouse = models.ForeignKey('setting.Warehouse', on_delete=models.CASCADE)  # optional but recommended

    def __str__(self):
        return f"{self.product.name} - {self.batch_number}"


# Stock movement logs (for audit & reports)
class StockMovement(models.Model):
    MOVEMENT_TYPE_CHOICES = [
        ('IN', 'Stock In'),
        ('OUT', 'Stock Out'),
        ('ADJUST', 'Adjustment'),
    ]
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE)
    movement_type = models.CharField(max_length=10, choices=MOVEMENT_TYPE_CHOICES)
    quantity = models.IntegerField()
    reason = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    ref_model = models.CharField(max_length=100, blank=True)  # e.g., 'SaleInvoice'
    ref_id = models.PositiveIntegerField(null=True, blank=True)  # link to invoice or voucher


    def __str__(self):
        return f"{self.batch} - {self.movement_type} - {self.quantity}"


# Party master (Customer/Supplier)
class Party(models.Model):
    PARTY_TYPES = (
        ('customer', 'Customer'),
        ('supplier', 'Supplier'),
    )
    name = models.CharField(max_length=255)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    party_type = models.CharField(max_length=10, choices=PARTY_TYPES)

    def __str__(self):
        return f"{self.name} ({self.party_type})"
