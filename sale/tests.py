from datetime import date

from django.core.exceptions import ValidationError
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
from utils.stock import stock_in, stock_out
from .models import SaleInvoice

User = get_user_model()


def setup_basic_entities():
    """Factory to create commonly used objects for sales tests."""
    asset = AccountType.objects.create(name="ASSET")
    income = AccountType.objects.create(name="INCOME")
    customer_account = ChartOfAccount.objects.create(
        name="Customer", code="1000", account_type=asset
    )
    sales_account = ChartOfAccount.objects.create(
        name="Sales", code="4000", account_type=income
    )
    branch = Branch.objects.create(name="Main", address="addr")
    warehouse = Warehouse.objects.create(
        name="W1", branch=branch, default_sales_account=sales_account
    )
    city = City.objects.create(name="Metropolis")
    area = Area.objects.create(name="Center", city=city)
    company = Company.objects.create(name="C1")
    group = Group.objects.create(name="G1")
    distributor = Distributor.objects.create(name="D1")
    product = Product.objects.create(
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
    customer = Party.objects.create(
        name="Cust",
        address="addr",
        phone="123",
        party_type="customer",
        chart_of_account=customer_account,
        city=city,
        area=area,
    )
    return {
        "customer_account": customer_account,
        "warehouse": warehouse,
        "product": product,
        "customer": customer,
    }


class SaleInvoiceVoucherLinkTest(APITestCase):
    """Ensure a voucher is linked when invoices are created via the API."""

    def setUp(self):
        data = setup_basic_entities()
        self.customer_account = data["customer_account"]
        self.warehouse = data["warehouse"]
        self.product = data["product"]
        self.customer = data["customer"]
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
            grand_total=10,
            paid_amount=10,
            net_amount=10,
            payment_method="Cash",
            status="Paid",
        )
        self.assertIsNotNone(invoice.voucher)

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
            grand_total=10,
            paid_amount=0,
            net_amount=10,
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

    def test_status_action_requires_status(self):
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
            payment_method="Cash",
            status="Pending",
        )
        self.client.force_authenticate(user=self.user)
        resp = self.client.patch(
            f"/sales/invoices/{invoice.id}/status/", {}, format="json"
        )
        self.assertEqual(resp.status_code, 400)

    def test_stock_out_raises_when_insufficient(self):
        stock_in(
            self.product,
            quantity=5,
            batch_number="B1",
            expiry_date=date.today(),
            purchase_price=5,
            sale_price=8,
            reason="init",
        )
        with self.assertRaises(ValidationError):
            stock_out(self.product, 10, "insufficient")
