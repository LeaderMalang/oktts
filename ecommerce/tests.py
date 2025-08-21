from datetime import date

from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

from inventory.models import Party, Product
from setting.models import Company, Distributor, Group, City, Area, Branch, Warehouse
from voucher.models import AccountType, ChartOfAccount

from .models import Order
from sale.models import SaleInvoice, SaleInvoiceItem


class OrderAPITestCase(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user("user@example.com", "pass")
        self.client.force_authenticate(self.user)

        city = City.objects.create(name="Metropolis")
        area = Area.objects.create(name="Center", city=city)

        asset = AccountType.objects.create(name="ASSET")
        income = AccountType.objects.create(name="INCOME")
        self.customer_account = ChartOfAccount.objects.create(
            name="Customer", code="1000", account_type=asset
        )
        self.sales_account = ChartOfAccount.objects.create(
            name="Sales", code="4000", account_type=income
        )
        branch = Branch.objects.create(name="Main", address="addr")
        self.warehouse = Warehouse.objects.create(
            name="W1", branch=branch, default_sales_account=self.sales_account
        )

        self.customer = Party.objects.create(
            name="Cust",
            address="addr",
            phone="123",
            party_type="customer",
            city=city,
            area=area,
            chart_of_account=self.customer_account,
        )

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

    def test_create_order(self):
        url = "/ecommerce/orders/"
        data = {
            "order_no": "ORD-001",
            "date": date.today(),
            "customer": self.customer.id,
            "status": "Pending",
            "total_amount": "10.00",
            "items": [
                {
                    "product": self.product.id,
                    "quantity": 1,
                    "price": "10.00",
                    "amount": "10.00",
                }
            ],
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Order.objects.count(), 1)
        order = Order.objects.first()
        self.assertEqual(order.order_no, "ORD-001")
        self.assertEqual(order.items.count(), 1)

    def test_confirm_order_creates_invoice(self):
        order_url = "/ecommerce/orders/"
        order_data = {
            "order_no": "ORD-002",
            "date": date.today(),
            "customer": self.customer.id,
            "status": "Pending",
            "total_amount": "10.00",
            "items": [
                {
                    "product": self.product.id,
                    "quantity": 1,
                    "price": "10.00",
                    "amount": "10.00",
                }
            ],
        }
        create_resp = self.client.post(order_url, order_data, format="json")
        self.assertEqual(create_resp.status_code, 201)
        order_id = create_resp.data["id"]

        confirm_url = f"/ecommerce/orders/{order_id}/confirm/"
        resp = self.client.post(
            confirm_url,
            {"warehouse": self.warehouse.id, "payment_method": "Cash"},
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        order = Order.objects.get(id=order_id)
        self.assertEqual(order.status, "Confirmed")
        self.assertIsNotNone(order.sale_invoice)
        self.assertEqual(SaleInvoice.objects.count(), 1)
        invoice = SaleInvoice.objects.first()
        self.assertEqual(invoice.total_amount, order.total_amount)
        self.assertEqual(SaleInvoiceItem.objects.count(), 1)
        item = SaleInvoiceItem.objects.first()
        self.assertEqual(item.amount, order.items.first().amount)
