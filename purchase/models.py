from django.db import models
from inventory.models import Product,Party
from setting.models import Warehouse
from voucher.models import Voucher
from utils.stock import stock_in,stock_return
from utils.voucher import create_voucher_for_transaction
# Create your models here.
class PurchaseInvoice(models.Model):
    invoice_no = models.CharField(max_length=50, unique=True)
    date = models.DateField()
    supplier = models.ForeignKey(Party, on_delete=models.CASCADE, limit_choices_to={'party_type': 'supplier'})
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    voucher = models.ForeignKey(Voucher, on_delete=models.SET_NULL, null=True, blank=True)
    def update_totals(self):
        total = sum(item.net_amount for item in self.items.all())
        self.total_amount = total
        type(self).objects.filter(pk=self.pk).update(total_amount=total)
        if self.voucher:
            self.voucher.amount = total
            self.voucher.save(update_fields=["amount"])
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        self.update_totals()

        if is_new:
            for item in self.items.all():
                # Create or update batch entry
                stock_in(
                    product=item.product,
                    quantity=item.quantity,
                    batch_number=item.batch_number,
                    expiry_date=item.expiry_date,
                    purchase_price=item.purchase_price,
                    sale_price=item.sale_price,
                    reason=f"Purchase Invoice {self.invoice_no}"
                )
        if not self.voucher:

            voucher = create_voucher_for_transaction(
                voucher_type_code='PUR',
                date=self.date,
                amount=self.total_amount,
                narration=f"Auto-voucher for Purchase Invoice {self.invoice_no}",
                debit_account=self.warehouse.default_purchase_account,
                credit_account=self.supplier.chart_of_account,
                created_by=self.created_by if hasattr(self, 'created_by') else None,
                branch=self.branch if hasattr(self, 'branch') else None,
            )
            self.voucher = voucher
            super().save(update_fields=['voucher'])


class PurchaseInvoiceItem(models.Model):
    invoice = models.ForeignKey(PurchaseInvoice, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    batch_number= models.CharField(max_length=50, unique=True)
    expiry_date = models.DateField()
    quantity = models.PositiveIntegerField()
    bonus = models.PositiveIntegerField(default=0)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price=models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def save(self, *args, **kwargs):
        self.amount = self.quantity * self.purchase_price
        self.net_amount = self.amount - self.discount
        super().save(*args, **kwargs)
        self.invoice.update_totals()

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
                stock_return(
                    product=item.product,
                    quantity=item.quantity,
                    batch_number=item.batch_number,
                    reason=f"Sale Return {self.return_no}"
                )
        if not self.voucher:
            voucher = create_voucher_for_transaction(
            voucher_type_code='PRN',  # Purchase Return
            date=self.date,
            amount=self.total_amount,
            narration=f"Auto-voucher for Purchase Return {self.return_no}",
            debit_account=self.supplier.chart_of_account,  # refund to supplier
            credit_account=self.warehouse.purchase_account,  # reduce purchase
            created_by=getattr(self, 'created_by', None),
            branch=getattr(self, 'branch', None)
             )
            self.voucher = voucher
            self.save(update_fields=['voucher'])
        

class PurchaseReturnItem(models.Model):
    return_invoice = models.ForeignKey(PurchaseReturn, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    batch_number= models.CharField(max_length=50, unique=True)
    expiry_date = models.DateField()
    quantity = models.PositiveIntegerField()
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price=models.DecimalField(max_digits=10, decimal_places=2)
    amount = models.DecimalField(max_digits=12, decimal_places=2)