from django.urls import reverse
from django.test import TestCase
from setting.models import Company, Group, Distributor
from .models import Product, PriceList, PriceListItem


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
