from datetime import date

from decimal import Decimal


from django.test import TestCase
from django.conf import settings

from inventory.models import Party
from setting.models import Branch, Warehouse
from voucher.models import AccountType, ChartOfAccount, VoucherType
from .models import PurchaseInvoice, PurchaseReturn

from voucher.test_utils import assert_ledger_entries



settings.MIGRATION_MODULES = {
    "sale": None,
    "purchase": None,
    "inventory": None,
}


class PurchaseBalanceTests(TestCase):
    """Ensure supplier balances adjust for purchase transactions."""

    def setUp(self):
        liability = AccountType.objects.create(name="LIABILITY")
        expense = AccountType.objects.create(name="EXPENSE")
        self.supplier_account = ChartOfAccount.objects.create(
            name="Supplier", code="2100", account_type=liability
        )
        self.purchase_account = ChartOfAccount.objects.create(
            name="Purchases", code="5100", account_type=expense
        )
        self.branch = Branch.objects.create(name="Main", address="addr")
        self.warehouse = Warehouse.objects.create(
            name="W1", branch=self.branch, default_purchase_account=self.purchase_account
        )
        self.supplier = Party.objects.create(
            name="Supp", address="addr", phone="123", party_type="supplier", chart_of_account=self.supplier_account
        )
        VoucherType.objects.create(name="Purchase", code="PUR")
        VoucherType.objects.create(name="Purchase Return", code="PRN")

    def test_cash_purchase_does_not_change_balance(self):
        PurchaseInvoice.objects.create(
            invoice_no="PI-100",
            date=date.today(),
            supplier=self.supplier,
            warehouse=self.warehouse,
            total_amount=100,
            discount=0,
            tax=0,
            grand_total=100,
            payment_method="Cash",
            paid_amount=100,
            status="Paid",
        )
        self.supplier.refresh_from_db()
        self.assertEqual(self.supplier.current_balance, 0)

    def test_credit_purchase_increases_balance(self):
        PurchaseInvoice.objects.create(
            invoice_no="PI-101",
            date=date.today(),
            supplier=self.supplier,
            warehouse=self.warehouse,
            total_amount=100,
            discount=0,
            tax=0,
            grand_total=100,
            payment_method="Credit",
            paid_amount=0,
            status="Pending",
        )
        self.supplier.refresh_from_db()
        self.assertEqual(self.supplier.current_balance, 100)

    def test_purchase_return_reduces_balance(self):
        PurchaseInvoice.objects.create(
            invoice_no="PI-102",
            date=date.today(),
            supplier=self.supplier,
            warehouse=self.warehouse,
            total_amount=100,
            discount=0,
            tax=0,
            grand_total=100,
            payment_method="Credit",
            paid_amount=0,
            status="Pending",
        )
        PurchaseReturn.objects.create(
            return_no="PR-1",
            date=date.today(),
            supplier=self.supplier,
            warehouse=self.warehouse,
            total_amount=30,
        )
        self.supplier.refresh_from_db()
        self.assertEqual(self.supplier.current_balance, 70)





class PurchaseVoucherTests(TestCase):
    def setUp(self):
        asset = AccountType.objects.create(name="ASSET")
        liability = AccountType.objects.create(name="LIABILITY")
        self.inventory_account = ChartOfAccount.objects.create(
            name="Inventory", code="1100", account_type=asset
        )
        self.supplier_account = ChartOfAccount.objects.create(
            name="Supplier", code="2100", account_type=liability
        )
        self.branch = Branch.objects.create(name="Main", address="addr")
        self.warehouse = Warehouse.objects.create(
            name="W1", branch=self.branch, default_purchase_account=self.inventory_account
        )
        self.supplier = Party.objects.create(
            name="Supp",
            address="addr",
            phone="123",
            party_type="supplier",
            chart_of_account=self.supplier_account,
        )
        VoucherType.objects.create(name="Purchase", code="PUR")
        VoucherType.objects.create(name="Purchase Return", code="PRN")
        # model uses non-existent attribute purchase_account in return, patch it
        self.warehouse.purchase_account = self.inventory_account

    def test_purchase_invoice_posts_ledger_entries(self):
        invoice = PurchaseInvoice.objects.create(
            invoice_no="PINV-1",
            date=date.today(),
            supplier=self.supplier,
            warehouse=self.warehouse,
            total_amount=100,
            discount=0,
            tax=0,
            grand_total=100,
            payment_method="Cash",
            paid_amount=100,
            status="Paid",
        )
        self.assertIsNotNone(invoice.voucher)
        assert_ledger_entries(
            self,
            invoice.voucher,
            [
                (self.inventory_account, Decimal("100"), Decimal("0")),
                (self.supplier_account, Decimal("0"), Decimal("100")),
            ],
        )

    def test_purchase_return_posts_ledger_entries(self):
        pr = PurchaseReturn.objects.create(
            return_no="PR-1",
            date=date.today(),
            supplier=self.supplier,
            warehouse=self.warehouse,
            total_amount=50,
        )
        self.assertIsNotNone(pr.voucher)
        assert_ledger_entries(
            self,
            pr.voucher,
            [
                (self.supplier_account, Decimal("50"), Decimal("0")),
                (self.inventory_account, Decimal("0"), Decimal("50")),
            ],
        )

