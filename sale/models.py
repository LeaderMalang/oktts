from django.db import models

from setting.models import Warehouse

from inventory.models import Party, Product, Batch


import logging

from voucher.models import Voucher, ChartOfAccount, VoucherType
from utils.voucher import create_voucher_for_transaction
from utils.stock import stock_return, stock_out
from finance.models import PaymentTerm, PaymentSchedule
from datetime import timedelta
from setting.constants import TAX_PAYABLE_ACCOUNT_CODE

logger = logging.getLogger(__name__)

# Create your models here.
class SaleInvoice(models.Model):
    PAYMENT_CHOICES = (("Cash", "Cash"), ("Credit", "Credit"))
    STATUS_CHOICES = (("Pending", "Pending"), ("Paid", "Paid"), ("Cancelled", "Cancelled"))

    invoice_no = models.CharField(max_length=50, unique=True)
    company_invoice_number = models.CharField(max_length=50, null=True, blank=True)
    date = models.DateField()
    customer = models.ForeignKey(Party, on_delete=models.CASCADE, limit_choices_to={'party_type': 'customer'})
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)
    
    recoveries = models.ManyToManyField('hr.Employee', through='RecoveryLog', related_name='recovery_invoices', blank=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)


 

    booking_man_id = models.ForeignKey(
        'hr.Employee',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bookings',
    )
    # supplying_man_id = models.ForeignKey(
    #     'hr.Employee',
    #     on_delete=models.SET_NULL,
    #     null=True,
    #     blank=True,
    #     related_name='supplies',
    # )
    delivery_man_id = models.ForeignKey(
        'hr.Employee',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='deliveries',
    )
    city_id = models.ForeignKey('setting.City', on_delete=models.SET_NULL, null=True, blank=True)
    area_id = models.ForeignKey('setting.Area', on_delete=models.SET_NULL, null=True, blank=True)
    sub_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_amount = models.DecimalField(max_digits=12, decimal_places=2)
    qr_code = models.CharField(max_length=255, blank=True)
    voucher = models.ForeignKey(Voucher, on_delete=models.SET_NULL, null=True, blank=True)

    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES)
    payment_term = models.ForeignKey(PaymentTerm, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")


    def save(self, *args, **kwargs):
        # --- Compute financial totals ---
        # Grand total is base amount minus discount plus tax
        self.grand_total = (self.total_amount or 0) - (self.discount or 0) + (self.tax or 0)
        # Paid amount defaults to zero if not provided
        self.paid_amount = self.paid_amount or 0
        # Net amount represents the remaining balance after payment
        self.net_amount = self.grand_total - self.paid_amount
        # --- End financial calculations ---

        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            for item in self.items.all():
                stock_out(
                    product=item.product,
                    quantity=item.quantity + item.bonus,
                    reason=f"Sale Invoice {self.invoice_no}"
                )

            outstanding = self.grand_total - self.paid_amount
            if outstanding:
                self.customer.current_balance += outstanding
                self.customer.save(update_fields=["current_balance"])

            if self.payment_term:
                installment_amount = self.grand_total / (self.payment_term.installments or 1)
                for i in range(self.payment_term.installments):
                    due_date = self.date + timedelta(days=self.payment_term.interval_days * (i + 1))
                    PaymentSchedule.objects.create(
                        term=self.payment_term,
                        sale_invoice=self,
                        due_date=due_date,
                        amount=installment_amount,
                    )

        if not self.voucher:
            if self.payment_method == "Cash":
                debit_account = self.warehouse.default_cash_account or self.warehouse.default_bank_account
            else:
                debit_account = self.customer.chart_of_account

            if self.tax and self.tax > 0:
                voucher_type = VoucherType.objects.get(code="SAL")
                tax_account = ChartOfAccount.objects.get(code=TAX_PAYABLE_ACCOUNT_CODE)
                entries = [
                    {"account": debit_account, "debit": self.grand_total, "credit": 0},
                    {
                        "account": self.warehouse.default_sales_account,
                        "debit": 0,
                        "credit": self.grand_total - self.tax,
                    },
                    {"account": tax_account, "debit": 0, "credit": self.tax},
                ]
                voucher = Voucher.create_with_entries(
                    voucher_type=voucher_type,
                    date=self.date,
                    narration=f"Auto-voucher for Sale Invoice {self.invoice_no}",
                    created_by=getattr(self, "created_by", None),
                    entries=entries,
                    branch=getattr(self, "branch", None),
                )
            else:
                voucher = create_voucher_for_transaction(
                    voucher_type_code='SAL',
                    date=self.date,
                    amount=self.grand_total,
                    narration=f"Auto-voucher for Sale Invoice {self.invoice_no}",
                    debit_account=debit_account,
                    credit_account=self.warehouse.default_sales_account,
                    created_by=getattr(self, 'created_by', None),
                    branch=getattr(self, 'branch', None)
                )
            self.voucher = voucher
            super().save(update_fields=['voucher'])
            logger.info("Linked voucher %s to sale invoice %s", voucher.pk, self.pk)




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
    bid_amount=models.DecimalField(max_digits=12, decimal_places=2, default=0)

class SaleReturn(models.Model):
    PAYMENT_CHOICES = (("Cash", "Cash"), ("Credit", "Credit"))
    return_no = models.CharField(max_length=50, unique=True)
    date = models.DateField()
    invoice = models.ForeignKey('SaleInvoice', on_delete=models.SET_NULL, null=True, blank=True, related_name='returns')
    customer = models.ForeignKey(Party, on_delete=models.CASCADE, limit_choices_to={'party_type': 'customer'})
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default="Cash")
    voucher = models.ForeignKey(Voucher, on_delete=models.SET_NULL, null=True, blank=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        if self.items.exists() and not self.voucher:
            for item in self.items.all():
                stock_return(
                    product=item.product,
                    quantity=item.quantity,
                    batch_number=item.batch_number,
                    reason=f"Sale Return {self.return_no}"
                )

            self.customer.current_balance -= self.total_amount
            self.customer.save(update_fields=["current_balance"])
        if not self.voucher:



            payment_method = (
                self.invoice.payment_method if self.invoice else "Cash"
            )
            if payment_method == "Cash":
                credit_account = ChartOfAccount.objects.get(code="1001")
            else:
                credit_account = self.customer.chart_of_account
                if self.customer and self.customer.current_balance is not None:
                    self.customer.current_balance -= self.total_amount
                    self.customer.save(update_fields=["current_balance"])



            voucher = create_voucher_for_transaction(
                voucher_type_code='SRN',
                date=self.date,
                amount=self.total_amount,
                narration=f"Auto-voucher for Sale Return {self.return_no}",

                debit_account=self.warehouse.default_sales_account,  # reverse sale
                credit_account=credit_account,  # reduce receivable
                created_by=getattr(self, 'created_by', None),
                branch=getattr(self, 'branch', None),
            )
            self.voucher = voucher
            self.save(update_fields=["voucher"])


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



class RecoveryLog(models.Model):
    invoice = models.ForeignKey(SaleInvoice, on_delete=models.CASCADE, related_name='recovery_logs')
    employee = models.ForeignKey('hr.Employee', on_delete=models.SET_NULL, null=True, blank=True, related_name='recovery_logs')
    date = models.DateField()
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.invoice.invoice_no} - {self.date}"

