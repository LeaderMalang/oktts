import json
from datetime import date, timedelta

from django.test import TestCase
from django.urls import reverse

from setting.models import Branch, Company, Distributor, Group, Warehouse
from .models import Batch, PriceList, PriceListItem, Product, StockMovement


class PriceListAPITest(TestCase):
    def setUp(self):
        company = Company.objects.create(name="Comp")
        group = Group.objects.create(name="Grp")
        distributor = Distributor.objects.create(name="Dist")
        self.product = Product.objects.create(
            name="Prod",
            barcode="123",
            company=company,
            group=group,
            distributor=distributor,
            trade_price=10,
            retail_price=12,
            sales_tax_ratio=1,
            fed_tax_ratio=1,
            disable_sale_purchase=False,
        )
        self.price_list = PriceList.objects.create(name="List")
        PriceListItem.objects.create(price_list=self.price_list, product=self.product, custom_price=8)

    def test_price_list_detail_endpoint(self):
        url = reverse('price_list_detail', args=[self.price_list.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['name'], 'List')
        self.assertEqual(len(data['items']), 1)
        self.assertEqual(data['items'][0]['custom_price'], '8.00')


class StockAuditAPITest(TestCase):
    def setUp(self):
        company = Company.objects.create(name="Comp")
        group = Group.objects.create(name="Grp")
        distributor = Distributor.objects.create(name="Dist")
        branch = Branch.objects.create(name="Main", address="addr", sale_invoice_footer="")
        warehouse = Warehouse.objects.create(name="WH", branch=branch)
        self.product = Product.objects.create(
            name="Prod",
            barcode="123",
            company=company,
            group=group,
            distributor=distributor,
            trade_price=10,
            retail_price=12,
            sales_tax_ratio=1,
            fed_tax_ratio=1,
            disable_sale_purchase=False,
        )
        self.batch1 = Batch.objects.create(
            product=self.product,
            batch_number="B1",
            expiry_date=date.today() + timedelta(days=30),
            purchase_price=5,
            sale_price=6,
            quantity=10,
            warehouse=warehouse,
        )
        self.batch2 = Batch.objects.create(
            product=self.product,
            batch_number="B2",
            expiry_date=date.today() + timedelta(days=60),
            purchase_price=5,
            sale_price=6,
            quantity=5,
            warehouse=warehouse,
        )

    def test_audit_updates_stock_and_records_movements(self):
        url = reverse('inventory_audit')
        payload = {
            "batches": [
                {"batch_id": self.batch1.id, "count": 8},
                {"batch_id": self.batch2.id, "count": 7},
            ]
        }
        response = self.client.post(
            url, data=json.dumps(payload), content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)

        self.batch1.refresh_from_db()
        self.batch2.refresh_from_db()
        self.assertEqual(self.batch1.quantity, 8)
        self.assertEqual(self.batch2.quantity, 7)

        movements = StockMovement.objects.order_by('batch__batch_number')
        self.assertEqual(movements.count(), 2)
        self.assertEqual(movements[0].movement_type, 'ADJUST')
        self.assertEqual(movements[0].quantity, -2)
        self.assertEqual(movements[1].movement_type, 'ADJUST')
        self.assertEqual(movements[1].quantity, 2)
