from datetime import date

from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from inventory.models import Party, Product
from setting.models import Branch, Company, Distributor, Group, Warehouse
from voucher.models import AccountType, ChartOfAccount, VoucherType
from utils.stock import stock_in
from .models import PurchaseInvoice

User = get_user_model()


def setup_entities():
    asset = AccountType.objects.create(name="ASSET")
    expense = AccountType.objects.create(name="EXPENSE")
    supplier_account = ChartOfAccount.objects.create(
        name="Supplier", code="2000", account_type=asset
    )
    purchase_account = ChartOfAccount.objects.create(
        name="Purchase", code="5000", account_type=expense
    )
    branch = Branch.objects.create(name="Main", address="addr")
    warehouse = Warehouse.objects.create(
        name="W1", branch=branch, default_purchase_account=purchase_account
    )
    company = Company.objects.create(name="C1")
    group = Group.objects.create(name="G1")
    distributor = Distributor.objects.create(name="D1")
    product = Product.objects.create(
        name="Prod",
        barcode="123",
        company=company,
        group=group,
        distributor=distributor,
        trade_price=10,
        retail_price=12,
        sales_tax_ratio=0,
        fed_tax_ratio=0,
        disable_sale_purchase=False,
    )
    supplier = Party.objects.create(
        name="Supp",
        address="addr",
        phone="123",
        party_type="supplier",
        chart_of_account=supplier_account,
    )
    return {
        "warehouse": warehouse,
        "supplier": supplier,
        "product": product,
    }


class PurchaseInvoiceTests(APITestCase):
    def setUp(self):
        data = setup_entities()
        self.warehouse = data["warehouse"]
        self.supplier = data["supplier"]
        self.product = data["product"]
        VoucherType.objects.create(name="Purchase", code="PUR")
        self.user = User.objects.create_user("user@example.com", "pass")

    def test_voucher_created_on_save(self):
        invoice = PurchaseInvoice.objects.create(
            invoice_no="PINV-001",
            date=date.today(),
            supplier=self.supplier,
            warehouse=self.warehouse,
            total_amount=100,
            discount=0,
            tax=0,
            grand_total=100,
            payment_method="Cash",
            paid_amount=100,
        )
        self.assertIsNotNone(invoice.voucher)

    def test_invoice_list_endpoint(self):
        PurchaseInvoice.objects.create(
            invoice_no="PINV-002",
            date=date.today(),
            supplier=self.supplier,
            warehouse=self.warehouse,
            total_amount=50,
            discount=0,
            tax=0,
            grand_total=50,
            payment_method="Cash",
            paid_amount=50,
        )
        response = self.client.get("/purchase/invoices/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_stock_in_duplicate_batch_invalid(self):
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
            stock_in(
                self.product,
                quantity=5,
                batch_number="B1",
                expiry_date=date.today(),
                purchase_price=5,
                sale_price=8,
                reason="dup",
            )

