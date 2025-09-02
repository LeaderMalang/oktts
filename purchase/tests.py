from datetime import date
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase

from django_ledger.models import (
    AccountModel,
    ChartOfAccountModel,
    EntityModel,
    LedgerModel,
)

from inventory.models import Party, Product
from setting.models import Branch, Company, Distributor, Group, Warehouse
from purchase.models import PurchaseInvoice, PurchaseReturn
from setting.constants import TAX_RECEIVABLE_ACCOUNT_CODE
from django.conf import settings


User = get_user_model()

settings.MIGRATION_MODULES = {
    'purchase': None,
    'inventory': None,
    'setting': None,
    'sale': None,
    'finance': None,
    'voucher': None,
    'hr': None,
}


def setup_entities():
    user = User.objects.create_user(email="user@example.com", password="pass")
    entity = EntityModel.objects.create(
        name="Entity",
        slug="entity",
        admin=user,
        address_1="addr",
        path="0001",
        depth=1,
    )
    coa = ChartOfAccountModel.objects.create(entity=entity)
    ledger = LedgerModel.objects.create(name="Main", entity=entity)

    inventory_account = AccountModel.objects.create(
        coa_model=coa,
        code="1100",
        name="Inventory",
        role="asset_ca_inv",
        balance_type="debit",
    )
    supplier_account = AccountModel.objects.create(
        coa_model=coa,
        code="2100",
        name="Supplier",
        role="lia_cl_acc_payable",
        balance_type="credit",
    )
    cash_account = AccountModel.objects.create(
        coa_model=coa,
        code="1000",
        name="Cash",
        role="asset_ca_cash",
        balance_type="debit",
    )
    AccountModel.objects.create(
        coa_model=coa,
        code=TAX_RECEIVABLE_ACCOUNT_CODE,
        name="Tax",
        role="asset_ca_other",
        balance_type="debit",
    )

    branch = Branch.objects.create(name="Main", address="addr")
    warehouse = Warehouse.objects.create(
        name="W1",
        branch=branch,
        default_purchase_account=inventory_account,
        default_cash_account=cash_account,
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
        "ledger": ledger,
        "warehouse": warehouse,
        "supplier": supplier,
        "product": product,
    }


class PurchaseInvoiceTests(TestCase):
    def setUp(self):
        data = setup_entities()
        self.warehouse = data["warehouse"]
        self.supplier = data["supplier"]

    def test_journal_entry_created_on_save(self):
        inv = PurchaseInvoice.objects.create(
            invoice_no="PINV-1",
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
        self.assertIsNotNone(inv.journal_entry)


class PurchaseBalanceTests(TestCase):
    def setUp(self):
        data = setup_entities()
        self.warehouse = data["warehouse"]
        self.supplier = data["supplier"]

    def test_credit_purchase_increases_balance(self):
        PurchaseInvoice.objects.create(
            invoice_no="PI-101",
            date=date.today(),
            supplier=self.supplier,
            warehouse=self.warehouse,
            total_amount=100,
            discount=0,
            tax=0,
            grand_total=100,
            payment_method="Credit",
            paid_amount=0,
        )
        self.supplier.refresh_from_db()
        self.assertEqual(self.supplier.current_balance, Decimal("100"))

    def test_purchase_return_reduces_balance(self):
        PurchaseInvoice.objects.create(
            invoice_no="PI-102",
            date=date.today(),
            supplier=self.supplier,
            warehouse=self.warehouse,
            total_amount=100,
            discount=0,
            tax=0,
            grand_total=100,
            payment_method="Credit",
            paid_amount=0,
        )
        PurchaseReturn.objects.create(
            return_no="PR-1",
            date=date.today(),
            supplier=self.supplier,
            warehouse=self.warehouse,
            total_amount=30,
        )
        self.supplier.refresh_from_db()
        self.assertEqual(self.supplier.current_balance, Decimal("70"))
