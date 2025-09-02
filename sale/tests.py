from datetime import date
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APITestCase

from django_ledger.models.entity import EntityModel
from django_ledger.models.chart_of_accounts import ChartOfAccountModel
from django_ledger.models.accounts import AccountModel
from django_ledger.models.ledger import LedgerModel
from django_ledger.models.transactions import TransactionModel

from inventory.models import Party, Product, Batch
from setting.models import (
    Branch,
    Warehouse,
    Company,
    Distributor,
    Group,
    City,
    Area,
)
from sale.models import SaleInvoice, SaleReturn, SaleReturnItem


User = get_user_model()


def setup_basic_entities():
    admin_user = User.objects.create_user("admin@example.com", "pass")
    entity = EntityModel.add_root(name="E1", admin=admin_user)
    coa = ChartOfAccountModel.objects.create(name="Default", entity=entity)
    LedgerModel.objects.create(entity=entity, name="Main")

    customer_account = AccountModel.add_root(
        name="Customer",
        code="1000",
        role="asset_ca_receivables",
        balance_type="debit",
        coa_model=coa,
    )
    sales_account = AccountModel.add_root(
        name="Sales",
        code="4000",
        role="in_operational",
        balance_type="credit",
        coa_model=coa,
    )
    cash_account = AccountModel.add_root(
        name="Cash",
        code="1100",
        role="asset_ca_cash",
        balance_type="debit",
        coa_model=coa,
    )

    branch = Branch.objects.create(name="Main", address="addr")
    warehouse = Warehouse.objects.create(
        name="W1",
        branch=branch,
        default_sales_account=sales_account,
        default_cash_account=cash_account,
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
        "sales_account": sales_account,
        "cash_account": cash_account,
        "warehouse": warehouse,
        "product": product,
        "customer": customer,
    }


class SaleInvoiceJournalTests(APITestCase):
    def setUp(self):
        data = setup_basic_entities()
        self.customer_account = data["customer_account"]
        self.sales_account = data["sales_account"]
        self.cash_account = data["cash_account"]
        self.warehouse = data["warehouse"]
        self.product = data["product"]
        self.customer = data["customer"]

    def test_cash_invoice_creates_journal_entry(self):
        invoice = SaleInvoice.objects.create(
            invoice_no="INV-1",
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
        self.assertIsNotNone(invoice.journal_entry)
        entries = TransactionModel.objects.filter(journal_entry=invoice.journal_entry)
        self.assertEqual(entries.count(), 4)
        self.assertTrue(
            entries.filter(
                account=self.customer_account,
                tx_type=TransactionModel.DEBIT,
                amount=Decimal("10"),
            ).exists()
        )
        self.assertTrue(
            entries.filter(
                account=self.sales_account,
                tx_type=TransactionModel.CREDIT,
                amount=Decimal("10"),
            ).exists()
        )
        self.assertTrue(
            entries.filter(
                account=self.cash_account,
                tx_type=TransactionModel.DEBIT,
                amount=Decimal("10"),
            ).exists()
        )
        self.assertTrue(
            entries.filter(
                account=self.customer_account,
                tx_type=TransactionModel.CREDIT,
                amount=Decimal("10"),
            ).exists()
        )


class SaleReturnJournalTests(TestCase):
    def setUp(self):
        data = setup_basic_entities()
        self.sales_account = data["sales_account"]
        self.cash_account = data["cash_account"]
        self.warehouse = data["warehouse"]
        self.product = data["product"]
        self.customer = data["customer"]
        Batch.objects.create(
            product=self.product,
            batch_number="B1",
            expiry_date=date.today(),
            purchase_price=5,
            sale_price=10,
            quantity=5,
            warehouse=self.warehouse,
        )

    def test_cash_return_creates_journal_entry_and_stock(self):
        sr = SaleReturn.objects.create(
            return_no="SR-1",
            date=date.today(),
            customer=self.customer,
            warehouse=self.warehouse,
            total_amount=5,
        )
        SaleReturnItem.objects.create(
            return_invoice=sr,
            product=self.product,
            batch_number="B1",
            expiry_date=date.today(),
            quantity=5,
            rate=1,
            discount1=0,
            discount2=0,
            amount=5,
            net_amount=5,
        )
        sr.save()
        self.assertIsNotNone(sr.journal_entry)
        entries = TransactionModel.objects.filter(journal_entry=sr.journal_entry)
        self.assertTrue(
            entries.filter(
                account=self.sales_account,
                tx_type=TransactionModel.DEBIT,
                amount=Decimal("5"),
            ).exists()
        )
        self.assertTrue(
            entries.filter(
                account=self.cash_account,
                tx_type=TransactionModel.CREDIT,
                amount=Decimal("5"),
            ).exists()
        )
        batch = Batch.objects.get(batch_number="B1")
        self.assertEqual(batch.quantity, 5)


class SaleBalanceTests(TestCase):
    def setUp(self):
        data = setup_basic_entities()
        self.warehouse = data["warehouse"]
        self.customer = data["customer"]

    def test_credit_sale_increases_balance(self):
        SaleInvoice.objects.create(
            invoice_no="INV-2",
            date=date.today(),
            customer=self.customer,
            warehouse=self.warehouse,
            total_amount=100,
            discount=0,
            tax=0,
            paid_amount=0,
            payment_method="Credit",
            status="Pending",
        )
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.current_balance, Decimal("100"))

    def test_sale_return_reduces_balance(self):
        SaleInvoice.objects.create(
            invoice_no="INV-3",
            date=date.today(),
            customer=self.customer,
            warehouse=self.warehouse,
            total_amount=100,
            discount=0,
            tax=0,
            paid_amount=0,
            payment_method="Credit",
            status="Pending",
        )
        SaleReturn.objects.create(
            return_no="SR-2",
            date=date.today(),
            customer=self.customer,
            warehouse=self.warehouse,
            total_amount=30,
            payment_method="Credit",
        )
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.current_balance, Decimal("70"))

