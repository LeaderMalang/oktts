from django.db import models
from setting.models import Warehouse, City, Area
from inventory.models import Party, Product, Batch
from voucher.models import Voucher
from utils.voucher import create_voucher_for_transaction
from utils.stock import stock_return, stock_out

# Create your models here.
class SaleInvoice(models.Model):
    invoice_no = models.CharField(max_length=50, unique=True)
    date = models.DateField()
    customer = models.ForeignKey(Party, on_delete=models.CASCADE, limit_choices_to={'party_type': 'customer'})
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)
    salesman = models.ForeignKey('hr.Employee', on_delete=models.SET_NULL, null=True, blank=True, related_name='sales')
    city_id = models.ForeignKey(City, on_delete=models.SET_NULL, null=True, blank=True)
    area_id = models.ForeignKey(Area, on_delete=models.SET_NULL, null=True, blank=True)
    supplying_staff = models.ForeignKey('hr.Employee', on_delete=models.SET_NULL, null=True, blank=True, related_name='supplied_sales')
    booking_staff = models.ForeignKey('hr.Employee', on_delete=models.SET_NULL, null=True, blank=True, related_name='booked_sales')
    delivery_staff = models.ForeignKey('hr.Employee', on_delete=models.SET_NULL, null=True, blank=True, related_name='delivered_sales')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_amount = models.DecimalField(max_digits=12, decimal_places=2)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    voucher = models.ForeignKey(Voucher, on_delete=models.SET_NULL, null=True, blank=True)
    payment_method = models.CharField(max_length=20, choices=(("Cash", "Cash"), ("Credit", "Credit")))
    payment_details = models.JSONField(null=True, blank=True)
    qr_code = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, default="Pending")
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)

        if is_new:
            for item in self.items.all():
                stock_out(
                    product=item.product,
                    quantity=item.quantity + item.bonus,
                    reason=f"Sale Invoice {self.invoice_no}"
                )
        
        if not self.voucher:
            voucher = create_voucher_for_transaction(
            voucher_type_code='SAL',
            date=self.date,
            amount=self.net_amount + self.tax,
            narration=f"Auto-voucher for Sale Invoice {self.invoice_no}",
            debit_account=self.customer.chart_of_account,  # customer owes us
            credit_account=self.warehouse.default_sales_account,   # record sale revenue
            created_by=getattr(self, 'created_by', None),
            branch=getattr(self, 'branch', None)
        )
        self.voucher = voucher
        self.save(update_fields=['voucher'])



class SaleInvoiceItem(models.Model):
    invoice = models.ForeignKey(SaleInvoice, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    batch = models.ForeignKey(Batch, null=True, blank=True, on_delete=models.SET_NULL)
    quantity = models.PositiveIntegerField()
    bonus = models.PositiveIntegerField(default=0)
    packing = models.PositiveIntegerField(default=0)
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    discount1 = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount2 = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    net_amount = models.DecimalField(max_digits=12, decimal_places=2)

class SaleReturn(models.Model):
    return_no = models.CharField(max_length=50, unique=True)
    date = models.DateField()
    customer = models.ForeignKey(Party, on_delete=models.CASCADE, limit_choices_to={'party_type': 'customer'})
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
            voucher_type_code='SRN',
            date=self.date,
            amount=self.total_amount,
            narration=f"Auto-voucher for Sale Return {self.return_no}",
            debit_account=self.warehouse.default_sales_account,        # reverse sale
            credit_account=self.customer.chart_of_account,     # reduce receivable
            created_by=getattr(self, 'created_by', None),
            branch=getattr(self, 'branch', None)
        )
        self.voucher = voucher
        self.save(update_fields=['voucher'])

class SaleReturnItem(models.Model):
    return_invoice = models.ForeignKey(SaleReturn, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    batch_number= models.CharField(max_length=50, unique=True)
    expiry_date = models.DateField()
    quantity = models.PositiveIntegerField()
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    discount1 = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount2 = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    net_amount = models.DecimalField(max_digits=12, decimal_places=2)