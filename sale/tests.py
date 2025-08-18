from datetime import date
from decimal import Decimal

from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from django.test import TestCase, SimpleTestCase
from unittest.mock import patch

from inventory.models import Party, Product
from setting.models import (
    Area,
    Branch,
    City,
    Company,
    Distributor,
    Group,
    Warehouse,
)
from voucher.models import AccountType, ChartOfAccount, VoucherType, Voucher
from hr.models import Employee
from .models import SaleInvoice, SaleReturn

User = get_user_model()


class SaleInvoiceVoucherLinkTest(APITestCase):
    """Ensure a voucher is linked when invoices are created via the API."""

    def setUp(self):
        asset = AccountType.objects.create(name="ASSET")
        income = AccountType.objects.create(name="INCOME")
        self.customer_account = ChartOfAccount.objects.create(
            name="Customer", code="1000", account_type=asset
        )
        self.cash_account = ChartOfAccount.objects.create(
            name="Cash", code="1100", account_type=asset
        )
        self.sales_account = ChartOfAccount.objects.create(
            name="Sales", code="4000", account_type=income
        )
        self.branch = Branch.objects.create(name="Main", address="addr")
        self.warehouse = Warehouse.objects.create(
            name="W1",
            branch=self.branch,
            default_sales_account=self.sales_account,
            default_cash_account=self.cash_account,
        )
        self.city = City.objects.create(name="Metropolis")
        self.area = Area.objects.create(name="Center", city=self.city)
        company = Company.objects.create(name="C1")
        group = Group.objects.create(name="G1")
        distributor = Distributor.objects.create(name="D1")
        self.product = Product.objects.create(
            name="P1",
            barcode="123",
            company=company,
            group=group,
            distributor=distributor,
            trade_price=10,
            retail_price=10,
            sales_tax_ratio=0,
            fed_tax_ratio=0,
            disable_sale_purchase=False,
        )
        self.customer = Party.objects.create(
            name="Cust",
            address="addr",
            phone="123",
            party_type="customer",
            chart_of_account=self.customer_account,
            city=self.city,
            area=self.area,
        )
        VoucherType.objects.create(name="Sale", code="SAL")
        self.user = User.objects.create_user("user@example.com", "pass")

    def test_cash_invoice_uses_cash_account(self):
        invoice = SaleInvoice.objects.create(
            invoice_no="INV-001",
            date=date.today(),
            customer=self.customer,
            warehouse=self.warehouse,
            total_amount=10,
            sub_total=10,
            discount=0,
            tax=0,
            paid_amount=10,
            payment_method="Cash",
            status="Paid",
        )

        debit_entry = invoice.voucher.entries.get(debit=invoice.grand_total)
        credit_entry = invoice.voucher.entries.get(credit=invoice.grand_total)
        self.assertEqual(debit_entry.account, self.cash_account)
        self.assertEqual(credit_entry.account, self.sales_account)

    def test_credit_invoice_uses_customer_account(self):
        invoice = SaleInvoice.objects.create(
            invoice_no="INV-003",
            date=date.today(),
            customer=self.customer,
            warehouse=self.warehouse,
            total_amount=10,
            sub_total=10,
            discount=0,
            tax=0,
            grand_total=10,
            paid_amount=0,
            net_amount=10,
            payment_method="Credit",
            status="Pending",
        )
        debit_entry = invoice.voucher.entries.get(debit=invoice.grand_total)
        credit_entry = invoice.voucher.entries.get(credit=invoice.grand_total)
        self.assertEqual(debit_entry.account, self.customer_account)
        self.assertEqual(credit_entry.account, self.sales_account)


    def test_status_action_updates_status_and_delivery_man(self):
        invoice = SaleInvoice.objects.create(
            invoice_no="INV-002",
            date=date.today(),
            customer=self.customer,
            warehouse=self.warehouse,
            total_amount=10,
            sub_total=10,
            discount=0,
            tax=0,
            payment_method="Cash",
            status="Pending",
        )
        self.client.force_authenticate(user=self.user)
        employee = Employee.objects.create(name="Delivery", phone="123")
        patch_data = {"status": "Paid", "delivery_man_id": employee.id}
        patch_resp = self.client.patch(
            f"/sales/invoices/{invoice.id}/status/", patch_data, format="json"
        )
        self.assertEqual(patch_resp.status_code, 200, patch_resp.data)
        self.assertEqual(patch_resp.data["status"], "Paid")
        self.assertEqual(patch_resp.data["delivery_man_id"], employee.id)


class SaleReturnVoucherLinkTest(SimpleTestCase):
    """Verify voucher linkage for sale returns without recursive save calls."""

    def test_sale_return_links_voucher_without_recursion(self):
        asset = AccountType(name="ASSET")
        income = AccountType(name="INCOME")
        customer_account = ChartOfAccount(name="CustAcc", code="1000", account_type=asset)
        sales_account = ChartOfAccount(name="Sales", code="4000", account_type=income)
        customer = Party(name="Cust", address="", phone="", party_type="customer", chart_of_account=customer_account)
        warehouse = Warehouse(name="W1", branch=Branch(name="B", address=""), default_sales_account=sales_account)
        sr = SaleReturn(return_no="SR-001", date=date.today(), total_amount=10, customer=customer, warehouse=warehouse)
        dummy_voucher = Voucher(
            voucher_type=VoucherType(code="SR", name="SR"), date=date.today(), amount=0
        )
        with patch("sale.models.create_voucher_for_transaction", return_value=dummy_voucher):
            with patch("django.db.models.Model.save", return_value=None):
                dummy_manager = type("M", (), {"all": lambda self: []})()
                with patch.object(SaleReturn, "items", dummy_manager):
                    with patch.object(SaleReturn, "save", wraps=SaleReturn.save, autospec=True) as mock_save:
                        sr.save()
                        self.assertEqual(mock_save.call_count, 1)
        self.assertIs(sr.voucher, dummy_voucher)
