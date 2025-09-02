from django.db import models

from setting.models import Warehouse

from inventory.models import Party, Product, Batch


import logging
from datetime import timedelta, datetime, time
from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from django_ledger.models import (
    AccountModel,
    JournalEntryModel,
    LedgerModel,
    TransactionModel,
)
from utils.stock import stock_return, stock_out
from finance.models import PaymentTerm, PaymentSchedule
from setting.constants import TAX_PAYABLE_ACCOUNT_CODE

logger = logging.getLogger(__name__)



def _cash_or_bank_for(warehouse):
    return warehouse.default_cash_account or warehouse.default_bank_account
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
    journal_entry = models.ForeignKey(
        JournalEntryModel, on_delete=models.SET_NULL, null=True, blank=True
    )

    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES)
    payment_term = models.ForeignKey(PaymentTerm, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")


    @transaction.atomic
    def save(self, *args, **kwargs):
        # Compute totals
        self.grand_total = (self.total_amount or 0) - (self.discount or 0) + (self.tax or 0)
        self.paid_amount = self.paid_amount or 0
        self.net_amount = self.grand_total - self.paid_amount

        is_new = self.pk is None
        super().save(*args, **kwargs)

        if is_new:
            # 1) Stock-out per item
            for item in self.items.all():
                stock_out(
                    product=item.product,
                    quantity=item.quantity + getattr(item, "bonus", 0),
                    reason=f"Sale Invoice {self.invoice_no}",
                )

            # 2) Customer balance increases by outstanding only
            outstanding = Decimal(self.grand_total) - Decimal(self.paid_amount or 0)
            if outstanding:
                self.customer.current_balance = (self.customer.current_balance or 0) + outstanding
                self.customer.save(update_fields=["current_balance"])

            # 3) Optional: payment schedule from payment_term
            if self.payment_term:
                installments = self.payment_term.installments or 1
                installment_amount = outstanding / installments
                for i in range(installments):
                    due_date = self.date + timedelta(days=self.payment_term.interval_days * (i + 1))
                    PaymentSchedule.objects.create(
                        term=self.payment_term,
                        sale_invoice=self,
                        due_date=due_date,
                        amount=installment_amount,
                    )

        # 4) Create journal entry once
        if not self.journal_entry:
            ledger = LedgerModel.objects.first()
            if ledger and self.warehouse.default_sales_account and self.customer.chart_of_account:
                timestamp = timezone.make_aware(
                    datetime.combine(self.date, time.min)
                )
                je = JournalEntryModel.objects.create(
                    ledger=ledger,
                    timestamp=timestamp,
                    description=f"Sale Invoice {self.invoice_no}",
                )
                transactions = [
                    TransactionModel(
                        journal_entry=je,
                        account=self.customer.chart_of_account,
                        tx_type=TransactionModel.DEBIT,
                        amount=self.grand_total,
                        description="Sale",
                    ),
                    TransactionModel(
                        journal_entry=je,
                        account=self.warehouse.default_sales_account,
                        tx_type=TransactionModel.CREDIT,
                        amount=self.grand_total - Decimal(self.tax or 0),
                        description="Revenue",
                    ),
                ]
                if self.tax:
                    tax_account = AccountModel.objects.filter(
                        code=TAX_PAYABLE_ACCOUNT_CODE
                    ).first()
                    if tax_account:
                        transactions.append(
                            TransactionModel(
                                journal_entry=je,
                                account=tax_account,
                                tx_type=TransactionModel.CREDIT,
                                amount=self.tax,
                                description="Tax payable",
                            )
                        )
                if Decimal(self.paid_amount or 0) > 0:
                    cash_or_bank = _cash_or_bank_for(self.warehouse)
                    if cash_or_bank:
                        transactions.append(
                            TransactionModel(
                                journal_entry=je,
                                account=cash_or_bank,
                                tx_type=TransactionModel.DEBIT,
                                amount=self.paid_amount,
                                description="Cash received",
                            )
                        )
                        transactions.append(
                            TransactionModel(
                                journal_entry=je,
                                account=self.customer.chart_of_account,
                                tx_type=TransactionModel.CREDIT,
                                amount=self.paid_amount,
                                description="Payment",
                            )
                        )
                TransactionModel.objects.bulk_create(transactions)
                self.journal_entry = je
                super().save(update_fields=["journal_entry"])




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
    journal_entry = models.ForeignKey(
        JournalEntryModel, on_delete=models.SET_NULL, null=True, blank=True
    )

    @transaction.atomic
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)

        # 1) Stock back in (per-line batches)
        if is_new and self.items.exists():
            for item in self.items.all():
                stock_return(
                    product=item.product,
                    quantity=item.quantity,
                    batch_number=getattr(item, "batch_number", ""),  # if you store it
                    reason=f"Sale Return {self.return_no}",
                )

        # 2) Journal entry (single composite)
        if not self.journal_entry:
            refund_now = self.payment_method == "Cash"
            ledger = LedgerModel.objects.first()
            if ledger and self.customer.chart_of_account:
                timestamp = timezone.make_aware(
                    datetime.combine(self.date, time.min)
                )
                je = JournalEntryModel.objects.create(
                    ledger=ledger,
                    timestamp=timestamp,
                    description=f"Sale Return {self.return_no}",
                )
                sales_return_account = getattr(
                    self.warehouse, "default_sales_return_account", None
                ) or self.warehouse.default_sales_account
                transactions = [
                    TransactionModel(
                        journal_entry=je,
                        account=sales_return_account,
                        tx_type=TransactionModel.DEBIT,
                        amount=self.total_amount - Decimal(getattr(self, "tax", 0) or 0),
                        description="Sales return",
                    )
                ]
                tax_amount = Decimal(getattr(self, "tax", 0) or 0)
                if tax_amount:
                    tax_account = AccountModel.objects.filter(
                        code=TAX_PAYABLE_ACCOUNT_CODE
                    ).first()
                    if tax_account:
                        transactions.append(
                            TransactionModel(
                                journal_entry=je,
                                account=tax_account,
                                tx_type=TransactionModel.DEBIT,
                                amount=tax_amount,
                                description="Tax reversal",
                            )
                        )
                target_account = (
                    _cash_or_bank_for(self.warehouse)
                    if refund_now
                    else self.customer.chart_of_account
                )
                transactions.append(
                    TransactionModel(
                        journal_entry=je,
                        account=target_account,
                        tx_type=TransactionModel.CREDIT,
                        amount=self.total_amount,
                        description="Refund" if refund_now else "Credit note",
                    )
                )
                TransactionModel.objects.bulk_create(transactions)
                self.journal_entry = je
                super().save(update_fields=["journal_entry"])

                if not refund_now:
                    self.customer.current_balance = (
                        self.customer.current_balance or 0
                    ) - Decimal(self.total_amount)
                    self.customer.save(update_fields=["current_balance"])


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
    net_amount = models.DecimalField(max_digits=12, decimal_places=2,default=0)



class RecoveryLog(models.Model):
    invoice = models.ForeignKey(SaleInvoice, on_delete=models.CASCADE, related_name='recovery_logs')
    employee = models.ForeignKey('hr.Employee', on_delete=models.SET_NULL, null=True, blank=True, related_name='recovery_logs')
    date = models.DateField()
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.invoice.invoice_no} - {self.date}"

