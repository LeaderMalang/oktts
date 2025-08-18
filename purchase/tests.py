from datetime import date

from django.test import TestCase

from inventory.models import Party
from setting.models import Branch, Warehouse
from voucher.models import AccountType, ChartOfAccount, VoucherType

from .models import PurchaseInvoice


class PurchaseInvoiceVoucherTest(TestCase):
    """Ensure vouchers use appropriate accounts based on payment method."""

    def setUp(self):
        asset = AccountType.objects.create(name="ASSET")
        liability = AccountType.objects.create(name="LIABILITY")
        expense = AccountType.objects.create(name="EXPENSE")
        self.cash_account = ChartOfAccount.objects.create(
            name="Cash", code="1100", account_type=asset
        )
        self.supplier_account = ChartOfAccount.objects.create(
            name="Supplier", code="2000", account_type=liability
        )
        self.purchase_account = ChartOfAccount.objects.create(
            name="Purchases", code="5000", account_type=expense
        )
        self.branch = Branch.objects.create(name="Main", address="addr")
        self.warehouse = Warehouse.objects.create(
            name="W1",
            branch=self.branch,
            default_purchase_account=self.purchase_account,
            default_cash_account=self.cash_account,
        )
        self.supplier = Party.objects.create(
            name="Supp",
            address="addr",
            phone="123",
            party_type="supplier",
            chart_of_account=self.supplier_account,
        )
        VoucherType.objects.create(name="Purchase", code="PUR")

    def test_cash_purchase_invoice_uses_cash_account(self):
        invoice = PurchaseInvoice.objects.create(
            invoice_no="PINV-001",
            date=date.today(),
            supplier=self.supplier,
            warehouse=self.warehouse,
            total_amount=10,
            discount=0,
            tax=0,
            grand_total=10,
            payment_method="Cash",
            paid_amount=10,
            status="Paid",
        )
        debit_entry = invoice.voucher.entries.get(debit=invoice.grand_total)
        credit_entry = invoice.voucher.entries.get(credit=invoice.grand_total)
        self.assertEqual(debit_entry.account, self.purchase_account)
        self.assertEqual(credit_entry.account, self.cash_account)

    def test_credit_purchase_invoice_uses_supplier_account(self):
        invoice = PurchaseInvoice.objects.create(
            invoice_no="PINV-002",
            date=date.today(),
            supplier=self.supplier,
            warehouse=self.warehouse,
            total_amount=10,
            discount=0,
            tax=0,
            grand_total=10,
            payment_method="Credit",
            paid_amount=0,
            status="Pending",
        )
        debit_entry = invoice.voucher.entries.get(debit=invoice.grand_total)
        credit_entry = invoice.voucher.entries.get(credit=invoice.grand_total)
        self.assertEqual(debit_entry.account, self.purchase_account)
        self.assertEqual(credit_entry.account, self.supplier_account)

