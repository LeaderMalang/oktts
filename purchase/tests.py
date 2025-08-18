from datetime import date

from django.test import SimpleTestCase
from unittest.mock import patch

from inventory.models import Party
from setting.models import Branch, Warehouse
from voucher.models import AccountType, ChartOfAccount, Voucher, VoucherType

from .models import PurchaseInvoice, PurchaseReturn


class PurchaseVoucherLinkTest(SimpleTestCase):
    """Ensure voucher linking happens once without recursive saves."""

    def _supplier_and_warehouse(self):
        asset = AccountType(name="ASSET")
        expense = AccountType(name="EXPENSE")
        supplier_account = ChartOfAccount(name="SuppAcc", code="2000", account_type=asset)
        purchase_account = ChartOfAccount(name="PurchAcc", code="5000", account_type=expense)

        supplier = Party(
            name="Supp", address="", phone="", party_type="supplier", chart_of_account=supplier_account
        )
        warehouse = Warehouse(
            name="W1", branch=Branch(name="B", address=""), default_purchase_account=purchase_account
        )
        warehouse.purchase_account = purchase_account
        return supplier, warehouse

    def test_purchase_invoice_voucher_link_no_recursion(self):
        supplier, warehouse = self._supplier_and_warehouse()
        invoice = PurchaseInvoice(
            invoice_no="PI-001", date=date.today(), total_amount=100, grand_total=100, supplier=supplier, warehouse=warehouse
        )
        dummy_voucher = Voucher(
            voucher_type=VoucherType(code="X", name="X"), date=date.today(), amount=0
        )
        with patch("purchase.models.create_voucher_for_transaction", return_value=dummy_voucher):
            with patch("django.db.models.Model.save", return_value=None):
                dummy_manager = type("M", (), {"all": lambda self: []})()
                with patch.object(PurchaseInvoice, "items", dummy_manager):
                    with patch.object(
                        PurchaseInvoice, "save", wraps=PurchaseInvoice.save, autospec=True
                    ) as mock_save:
                        invoice.save()
                        self.assertEqual(mock_save.call_count, 1)
        self.assertIs(invoice.voucher, dummy_voucher)

    def test_purchase_return_voucher_link_no_recursion(self):
        supplier, warehouse = self._supplier_and_warehouse()
        pr = PurchaseReturn(return_no="PR-001", date=date.today(), total_amount=50, supplier=supplier, warehouse=warehouse)
        dummy_voucher = Voucher(
            voucher_type=VoucherType(code="Y", name="Y"), date=date.today(), amount=0
        )
        with patch("purchase.models.create_voucher_for_transaction", return_value=dummy_voucher):
            with patch("django.db.models.Model.save", return_value=None):
                dummy_manager = type("M", (), {"all": lambda self: []})()
                with patch.object(PurchaseReturn, "items", dummy_manager):
                    with patch.object(
                        PurchaseReturn, "save", wraps=PurchaseReturn.save, autospec=True
                    ) as mock_save:
                        pr.save()
                        self.assertEqual(mock_save.call_count, 1)
        self.assertIs(pr.voucher, dummy_voucher)

