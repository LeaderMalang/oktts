from datetime import date
from decimal import Decimal

from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

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
from voucher.models import AccountType, ChartOfAccount, VoucherType
from hr.models import Employee
from .models import SaleInvoice

User = get_user_model()


class SaleInvoiceVoucherLinkTest(APITestCase):
    """Ensure a voucher is linked when invoices are created via the API."""

    def setUp(self):
        asset = AccountType.objects.create(name="ASSET")
        income = AccountType.objects.create(name="INCOME")
        self.customer_account = ChartOfAccount.objects.create(
            name="Customer", code="1000", account_type=asset
        )
        self.sales_account = ChartOfAccount.objects.create(
            name="Sales", code="4000", account_type=income
        )
        self.branch = Branch.objects.create(name="Main", address="addr")
        self.warehouse = Warehouse.objects.create(
            name="W1", branch=self.branch, default_sales_account=self.sales_account
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

    def test_voucher_linked_on_creation(self):
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
        self.assertIsNotNone(invoice.voucher)
        self.assertEqual(invoice.grand_total, Decimal("10"))
        self.assertEqual(invoice.net_amount, Decimal("0"))

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
