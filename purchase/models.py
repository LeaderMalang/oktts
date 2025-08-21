from django.db import models
from inventory.models import Product, Party
from setting.models import Warehouse
from voucher.models import Voucher, ChartOfAccount, VoucherType
from utils.stock import stock_in, stock_return, stock_out
from utils.voucher import create_voucher_for_transaction
from finance.models import PaymentTerm, PaymentSchedule
from datetime import timedelta
from setting.constants import TAX_RECEIVABLE_ACCOUNT_CODE
from decimal import Decimal
from django.db import transaction
from utils.voucher import post_composite_purchase_voucher,post_composite_purchase_return_voucher



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

    @transaction.atomic
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)

        if is_new:
            # 1) Stock-in per item
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

            # 2) Supplier balance increases by outstanding only
            outstanding = Decimal(self.grand_total) - Decimal(self.paid_amount or 0)
            if outstanding:
                self.supplier.current_balance = (self.supplier.current_balance or 0) + outstanding
                self.supplier.save(update_fields=["current_balance"])

            # 3) Optional: build payment schedule from payment_term (kept from your code)
            if self.payment_term:
                installment_amount = outstanding / (self.payment_term.installments or 1)
                for i in range(self.payment_term.installments):
                    due_date = self.date + timedelta(days=self.payment_term.interval_days * (i + 1))
                    PaymentSchedule.objects.create(
                        term=self.payment_term,
                        purchase_invoice=self,
                        due_date=due_date,
                        amount=installment_amount,
                    )

        # 4) Post the composite voucher once
        if not self.voucher:
            # Decide cash/bank account only if paid_amount > 0 (cash purchase or partial cash)
            cash_or_bank = None
            if (self.payment_method == "Cash") or (Decimal(self.paid_amount or 0) > 0):
                cash_or_bank = self.warehouse.default_cash_account or self.warehouse.default_bank_account

            voucher = post_composite_purchase_voucher(
                date=self.date,
                invoice_no=self.invoice_no,
                grand_total=Decimal(self.grand_total),
                tax=Decimal(self.tax or 0),
                paid_amount=Decimal(self.paid_amount or 0),
                purchase_account=self.warehouse.default_purchase_account,
                supplier_account=self.supplier.chart_of_account,
                cash_or_bank_account=cash_or_bank,
                created_by=getattr(self, "created_by", None),
                branch=getattr(self, "branch", None),
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


def _cash_or_bank_for(warehouse):
    return warehouse.default_cash_account or warehouse.default_bank_account
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

    @transaction.atomic
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)

        # 1) Stock out (we are sending goods back to supplier)
        if is_new and self.items.exists():
            for item in self.items.all():
                stock_out(
                    product=item.product,
                    quantity=item.quantity,
                    reason=f"Purchase Return {self.return_no}",
                )

        # 2) Voucher (single composite)
        if not self.voucher:
            refund_now = True if self.payment_method == "Cash" else False
            cash_or_bank = _cash_or_bank_for(self.warehouse) if refund_now else None

            # Choose your Purchase Returns account (contra expense)
            purchase_return_account = getattr(self.warehouse, "default_purchase_return_account", None) or self.warehouse.default_purchase_account

            voucher = post_composite_purchase_return_voucher(
                date=self.date,
                return_no=self.return_no,
                total_amount=Decimal(self.total_amount),
                tax=Decimal(getattr(self, "tax", 0) or 0),
                purchase_return_account=purchase_return_account,
                supplier_account=self.supplier.chart_of_account,
                cash_or_bank_account=cash_or_bank,
                refund_now=refund_now,
                created_by=getattr(self, "created_by", None),
                branch=getattr(self, "branch", None),
            )
            self.voucher = voucher
            super().save(update_fields=["voucher"])

            # 3) Supplier balance: ONLY adjust for credit note (A/P reduced).
            # (For cash refund we don't touch running balance unless your policy does.)
            if not refund_now:
                self.supplier.current_balance = (self.supplier.current_balance or 0) - Decimal(self.total_amount)
                self.supplier.save(update_fields=["current_balance"])
        

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

