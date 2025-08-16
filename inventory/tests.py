from django.urls import reverse
from django.test import TestCase

from setting.models import Company, Group, Distributor
from .models import Product, PriceList, PriceListItem, Batch, StockMovement
from django.utils import timezone
from datetime import datetime, timezone as dt_timezone



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



class StockMovementAPITest(TestCase):

    def setUp(self):
        company = Company.objects.create(name="Comp")
        group = Group.objects.create(name="Grp")
        distributor = Distributor.objects.create(name="Dist")


        self.product1 = Product.objects.create(
            name="Prod1",
            barcode="p1",

            company=company,
            group=group,
            distributor=distributor,
            trade_price=10,
            retail_price=12,
            sales_tax_ratio=1,
            fed_tax_ratio=1,
            disable_sale_purchase=False,
        )


        self.product2 = Product.objects.create(
            name="Prod2",
            barcode="p2",
            company=company,
            group=group,
            distributor=distributor,
            trade_price=15,
            retail_price=18,

            sales_tax_ratio=1,
            fed_tax_ratio=1,
            disable_sale_purchase=False,
        )

        # Create a branch and warehouse for batches
        from setting.models import Branch, Warehouse
        branch = Branch.objects.create(name="Main", address="Addr")
        warehouse = Warehouse.objects.create(name="WH", branch=branch)

        batch1 = Batch.objects.create(
            product=self.product1,
            batch_number="B1",
            expiry_date=timezone.now().date(),
            purchase_price=5,
            sale_price=6,
            quantity=100,
            warehouse=warehouse,
        )

        batch2 = Batch.objects.create(
            product=self.product2,
            batch_number="B2",
            expiry_date=timezone.now().date(),
            purchase_price=7,
            sale_price=8,
            quantity=200,
            warehouse=warehouse,
        )

        sm1 = StockMovement.objects.create(batch=batch1, movement_type='IN', quantity=10, reason='init')
        sm2 = StockMovement.objects.create(batch=batch1, movement_type='IN', quantity=5, reason='restock')
        sm3 = StockMovement.objects.create(batch=batch2, movement_type='IN', quantity=7, reason='restock')

        StockMovement.objects.filter(id=sm1.id).update(timestamp=datetime(2024, 1, 1, tzinfo=dt_timezone.utc))
        StockMovement.objects.filter(id=sm2.id).update(timestamp=datetime(2024, 2, 1, tzinfo=dt_timezone.utc))
        StockMovement.objects.filter(id=sm3.id).update(timestamp=datetime(2024, 2, 15, tzinfo=dt_timezone.utc))

    def test_stock_movement_list_filters(self):
        url = reverse('stock_movement_list')
        params = {
            'productId': self.product1.id,
            'startDate': '2024-01-15',
            'endDate': '2024-02-10',
        }
        response = self.client.get(url, params)
        self.assertEqual(response.status_code, 200)
        data = response.json()['movements']
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['productId'], self.product1.id)

