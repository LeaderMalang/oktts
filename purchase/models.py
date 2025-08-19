from django.db import models
from inventory.models import Product, Party
from setting.models import Warehouse
from voucher.models import Voucher, ChartOfAccount, VoucherType
from utils.stock import stock_in, stock_return, stock_out
from utils.voucher import create_voucher_for_transaction
from finance.models import PaymentTerm, PaymentSchedule
from datetime import timedelta
from setting.constants import TAX_RECEIVABLE_ACCOUNT_CODE


class PurchaseInvoice(models.Model):
    STATUS_CHOICES = (("Pending", "Pending"), ("Paid", "Paid"), ("Cancelled", "Cancelled"))
    invoice_no = models.CharField(max_length=50, unique=True)
    company_invoice_number = models.CharField(max_length=50, null=True, blank=True)
    date = models.DateField()
    supplier = models.ForeignKey(
        Party,
        on_delete=models.CASCADE,
        limit_choices_to={"party_type": "supplier"},
    )
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(
        max_length=20,
        choices=(("Cash", "Cash"), ("Credit", "Credit")),
        default="Cash",
    )
    payment_term = models.ForeignKey(PaymentTerm, on_delete=models.SET_NULL, null=True, blank=True)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    voucher = models.ForeignKey(Voucher, on_delete=models.SET_NULL, null=True, blank=True)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)

        if is_new:
            for item in self.items.all():
                stock_in(
                    product=item.product,
                    quantity=item.quantity,
                    batch_number=item.batch_number,
                    expiry_date=item.expiry_date,
                    purchase_price=item.purchase_price,
                    sale_price=item.sale_price,
                    reason=f"Purchase Invoice {self.invoice_no}",
                )


            outstanding = self.grand_total - self.paid_amount
            if outstanding:
                self.supplier.current_balance += outstanding
                self.supplier.save(update_fields=["current_balance"])

            if self.payment_term:
                installment_amount = self.grand_total / (self.payment_term.installments or 1)
                for i in range(self.payment_term.installments):
                    due_date = self.date + timedelta(days=self.payment_term.interval_days * (i + 1))
                    PaymentSchedule.objects.create(
                        term=self.payment_term,
                        purchase_invoice=self,
                        due_date=due_date,
                        amount=installment_amount,
                    )


        if not self.voucher:
            if self.payment_method == "Cash":
                credit_account = self.warehouse.default_cash_account or self.warehouse.default_bank_account
            else:
                credit_account = self.supplier.chart_of_account

            if self.tax and self.tax > 0:
                voucher_type = VoucherType.objects.get(code="PUR")
                tax_account = ChartOfAccount.objects.get(code=TAX_RECEIVABLE_ACCOUNT_CODE)
                entries = [
                    {
                        "account": self.warehouse.default_purchase_account,
                        "debit": self.grand_total - self.tax,
                        "credit": 0,
                    },
                    {"account": tax_account, "debit": self.tax, "credit": 0},
                    {"account": credit_account, "debit": 0, "credit": self.grand_total},
                ]
                voucher = Voucher.create_with_entries(
                    voucher_type=voucher_type,
                    date=self.date,
                    narration=f"Auto-voucher for Purchase Invoice {self.invoice_no}",
                    created_by=getattr(self, "created_by", None),
                    entries=entries,
                    branch=getattr(self, "branch", None),
                )
            else:
                voucher = create_voucher_for_transaction(
                    voucher_type_code="PUR",
                    date=self.date,
                    amount=self.grand_total,
                    narration=f"Auto-voucher for Purchase Invoice {self.invoice_no}",
                    debit_account=self.warehouse.default_purchase_account,
                    credit_account=credit_account,
                    created_by=self.created_by if hasattr(self, "created_by") else None,
                    branch=self.branch if hasattr(self, "branch") else None,
                )
            self.voucher = voucher
            super().save(update_fields=["voucher"])


class PurchaseInvoiceItem(models.Model):
    invoice = models.ForeignKey(
        PurchaseInvoice, related_name="items", on_delete=models.CASCADE
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    batch_number = models.CharField(max_length=50, unique=True)
    expiry_date = models.DateField()
    quantity = models.PositiveIntegerField()
    bonus = models.PositiveIntegerField(default=0)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    # net_amount = models.DecimalField(max_digits=12, decimal_places=2)

class PurchaseReturn(models.Model):
    PAYMENT_CHOICES = (("Cash", "Cash"), ("Credit", "Credit"))
    return_no = models.CharField(max_length=50, unique=True)
    date = models.DateField()
    invoice = models.ForeignKey('PurchaseInvoice', on_delete=models.SET_NULL, null=True, blank=True, related_name='returns')
    supplier = models.ForeignKey(Party, on_delete=models.CASCADE, limit_choices_to={'party_type': 'supplier'})
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default="Cash")
    voucher = models.ForeignKey(Voucher, on_delete=models.SET_NULL, null=True, blank=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        if self.items.exists() and not self.voucher:
            for item in self.items.all():
                stock_out(
                    product=item.product,
                    quantity=item.quantity,
                    reason=f"Purchase Return {self.return_no}"
                )

            self.supplier.current_balance -= self.total_amount
            self.supplier.save(update_fields=["current_balance"])
        if not self.voucher:
    


            payment_method = (
                self.invoice.payment_method if self.invoice else "Cash"
            )
            if payment_method == "Cash":
                debit_account = ChartOfAccount.objects.get(code="1001")
            else:
                debit_account = self.supplier.chart_of_account
                if self.supplier and self.supplier.current_balance is not None:
                    self.supplier.current_balance -= self.total_amount
                    self.supplier.save(update_fields=["current_balance"])


            voucher = create_voucher_for_transaction(
                voucher_type_code='PRN',
                date=self.date,
                amount=self.total_amount,
                narration=f"Auto-voucher for Purchase Return {self.return_no}",
                debit_account=debit_account,
                credit_account=self.warehouse.default_purchase_account,

                created_by=getattr(self, 'created_by', None),
                branch=getattr(self, 'branch', None)

            )
            self.voucher = voucher
            super().save(update_fields=['voucher'])
        

class PurchaseReturnItem(models.Model):
    return_invoice = models.ForeignKey(PurchaseReturn, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    batch_number= models.CharField(max_length=50, unique=True)
    expiry_date = models.DateField()
    quantity = models.PositiveIntegerField()
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price=models.DecimalField(max_digits=10, decimal_places=2)
    amount = models.DecimalField(max_digits=12, decimal_places=2)



class InvestorTransaction(models.Model):
    """Records cash movement related to an investor."""

    TRANSACTION_TYPES = (
        ("investment", "Investment"),
        ("payout", "Payout"),
        ("profit", "Profit"),
    )

    investor = models.ForeignKey(
        Party,
        on_delete=models.CASCADE,
        limit_choices_to={"party_type": "investor"},
    )
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    notes = models.TextField(blank=True)
    purchase_invoice = models.ForeignKey(
        PurchaseInvoice, on_delete=models.SET_NULL, null=True, blank=True, related_name="investor_transactions"
    )

    def __str__(self) -> str:  # pragma: no cover - display helper
        return f"{self.investor} - {self.transaction_type} - {self.amount}"

