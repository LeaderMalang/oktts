from datetime import date


from rest_framework.test import APITestCase

from inventory.models import Party, Product, Batch
from setting.models import Branch, Warehouse, Company, Distributor, Group
from voucher.models import AccountType, ChartOfAccount, VoucherType
from .models import PurchaseInvoice, PurchaseReturn, PurchaseReturnItem


class PurchaseReturnVoucherTest(APITestCase):
    def setUp(self):
        asset = AccountType.objects.create(name="ASSET")
        expense = AccountType.objects.create(name="EXPENSE")
        liability = AccountType.objects.create(name="LIABILITY")
        VoucherType.objects.create(name="Purchase", code="PUR")
        VoucherType.objects.create(name="Purchase Return", code="PRN")

        self.cash_account = ChartOfAccount.objects.create(name="Cash", code="1001", account_type=asset)
        self.supplier_account = ChartOfAccount.objects.create(name="Supplier", code="2001", account_type=liability)
        self.purchase_account = ChartOfAccount.objects.create(name="Purchase", code="5001", account_type=expense)



        self.branch = Branch.objects.create(name="Main", address="addr")
        self.warehouse = Warehouse.objects.create(
            name="W1",
            branch=self.branch,
            default_purchase_account=self.purchase_account,

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

        self.batch = Batch.objects.create(
            product=self.product,
            batch_number="B1",
            expiry_date=date.today(),
            purchase_price=10,
            sale_price=10,
            quantity=5,
            warehouse=self.warehouse,
        )

        self.supplier = Party.objects.create(
            name="Supp",
            address="addr",
            phone="321",
            party_type="supplier",
            chart_of_account=self.supplier_account,
        )

    def _create_invoice(self, method):
        return PurchaseInvoice.objects.create(
            invoice_no=f"PINV-{method}",
            date=date.today(),
            supplier=self.supplier,
            warehouse=self.warehouse,
            total_amount=50,
            discount=0,
            tax=0,
            grand_total=50,
            payment_method=method,
            paid_amount=50 if method == "Cash" else 0,
            status="Paid" if method == "Cash" else "Pending",
        )

    def test_cash_purchase_return_accounts_and_inventory(self):
        invoice = self._create_invoice("Cash")
        pr = PurchaseReturn.objects.create(
            return_no="PR1",
            date=date.today(),
            invoice=invoice,
            supplier=self.supplier,
            warehouse=self.warehouse,
            total_amount=50,
        )
        PurchaseReturnItem.objects.create(
            return_invoice=pr,
            product=self.product,
            batch_number="B1",
            expiry_date=date.today(),
            quantity=5,
            purchase_price=10,
            sale_price=10,
            amount=50,
        )
        pr.save()

        self.batch.refresh_from_db()
        self.assertEqual(self.batch.quantity, 0)
        debit = pr.voucher.entries.get(debit__gt=0)
        credit = pr.voucher.entries.get(credit__gt=0)
        self.assertEqual(debit.account, self.cash_account)
        self.assertEqual(credit.account, self.purchase_account)
        self.supplier.refresh_from_db()
        self.assertEqual(self.supplier.current_balance, 0)

    def test_credit_purchase_return_accounts_and_party_balance(self):
        self.supplier.current_balance = 50
        self.supplier.save()
        invoice = self._create_invoice("Credit")
        pr = PurchaseReturn.objects.create(
            return_no="PR2",
            date=date.today(),
            invoice=invoice,
            supplier=self.supplier,
            warehouse=self.warehouse,
            total_amount=20,
        )
        PurchaseReturnItem.objects.create(
            return_invoice=pr,
            product=self.product,
            batch_number="B1",
            expiry_date=date.today(),
            quantity=2,
            purchase_price=10,
            sale_price=10,
            amount=20,
        )
        pr.save()

        self.batch.refresh_from_db()
        self.assertEqual(self.batch.quantity, 3)
        debit = pr.voucher.entries.get(debit__gt=0)
        credit = pr.voucher.entries.get(credit__gt=0)
        self.assertEqual(debit.account, self.supplier_account)
        self.assertEqual(credit.account, self.purchase_account)
        self.supplier.refresh_from_db()
        self.assertEqual(self.supplier.current_balance, 30)

