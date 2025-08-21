from datetime import date

from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

from inventory.models import Party, Product
from setting.models import Company, Distributor, Group, City, Area

from .models import Order


class OrderAPITestCase(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user("user@example.com", "pass")
        self.client.force_authenticate(self.user)

        city = City.objects.create(name="Metropolis")
        area = Area.objects.create(name="Center", city=city)
        self.customer = Party.objects.create(
            name="Cust",
            address="addr",
            phone="123",
            party_type="customer",
            city=city,
            area=area,
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
