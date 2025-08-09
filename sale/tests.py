from datetime import date

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

from django.contrib.auth import get_user_model

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
        User = get_user_model()
        self.user = User.objects.create_user("user@example.com", "pass")

    def test_voucher_linked_on_creation(self):

        self.client.force_authenticate(user=self.user)
        payload = {
            "invoice_no": "INV-001",
            "date": date.today().isoformat(),
            "customer": self.customer.id,
            "warehouse": self.warehouse.id,
            "city_id": self.city.id,
            "area_id": self.area.id,
            "sub_total": "10.00",
            "total_amount": "10.00",
            "discount": "0",
            "tax": "0",
            "grand_total": "10.00",
            "paid_amount": "10.00",
            "net_amount": "10.00",
            "payment_method": "Cash",
            "status": "Paid",
            "items": [
                {
                    "product": self.product.id,
                    "quantity": 1,
                    "bonus": 0,
                    "packing": 0,
                    "rate": "10.00",
                    "discount1": 0,
                    "discount2": 0,
                    "amount": "10.00",
                    "net_amount": "10.00",
                }
            ],
        }
        response = self.client.post("/sales/invoices/", payload, format="json")
        self.assertEqual(response.status_code, 201, response.data)
        invoice = SaleInvoice.objects.get(id=response.data["id"])
        self.assertIsNotNone(invoice.voucher)

    def test_create_via_pos_action(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            "invoice_no": "INV-POS-001",
            "date": date.today().isoformat(),
            "customer": self.customer.id,
            "warehouse": self.warehouse.id,
            "city_id": self.city.id,
            "area_id": self.area.id,
            "sub_total": "10.00",
            "total_amount": "10.00",
            "discount": "0",
            "tax": "0",
            "grand_total": "10.00",
            "paid_amount": "10.00",
            "net_amount": "10.00",
            "payment_method": "Cash",
            "status": "Paid",
            "items": [
                {
                    "product": self.product.id,
                    "quantity": 1,
                    "bonus": 0,
                    "packing": 0,
                    "rate": "10.00",
                    "discount1": 0,
                    "discount2": 0,
                    "amount": "10.00",
                    "net_amount": "10.00",
                }
            ],
        }
        response = self.client.post("/sales/invoices/pos/", payload, format="json")
        self.assertEqual(response.status_code, 201, response.data)
        self.assertTrue(SaleInvoice.objects.filter(invoice_no="INV-POS-001").exists())

