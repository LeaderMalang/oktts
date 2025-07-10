from django.db import models
from inventory.models import Product,Party
from setting.models import Warehouse
from voucher.models import Voucher
from inventory.models import Batch, StockMovement
# Create your models here.
class PurchaseInvoice(models.Model):
    invoice_no = models.CharField(max_length=50, unique=True)
    date = models.DateField()
    supplier = models.ForeignKey(Party, on_delete=models.CASCADE, limit_choices_to={'party_type': 'supplier'})
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    voucher = models.ForeignKey(Voucher, on_delete=models.SET_NULL, null=True, blank=True)
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)

        if is_new:
            for item in self.items.all():
                # Create or update batch entry
                batch = Batch.objects.create(
                    product=item.product,
                    batch_number=f"PO-{self.invoice_no}",
                    expiry_date=self.date,  # or actual expiry from form
                    purchase_price=item.rate,
                    sale_price=item.rate,  # can be updated later
                    quantity=item.quantity
                )
                StockMovement.objects.create(
                    batch=batch,
                    movement_type='IN',
                    quantity=item.quantity,
                    reason=f"Purchase Invoice {self.invoice_no}"
                )


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
    voucher = models.ForeignKey(Voucher, on_delete=models.SET_NULL, null=True, blank=True)
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)

        if is_new:
            for item in self.items.all():
                batch = Batch.objects.filter(product=item.product, quantity__gte=item.quantity).order_by('-expiry_date').first()
                if batch:
                    batch.quantity -= item.quantity
                    batch.save()
                    StockMovement.objects.create(
                        batch=batch,
                        movement_type='OUT',
                        quantity=item.quantity,
                        reason=f"Purchase Return {self.return_no}"
                    )


class PurchaseReturnItem(models.Model):
    return_invoice = models.ForeignKey(PurchaseReturn, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    amount = models.DecimalField(max_digits=12, decimal_places=2)