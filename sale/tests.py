from datetime import date

from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from inventory.models import Party, Product
from setting.models import Branch, Warehouse, Company, Distributor, Group
from voucher.models import AccountType, ChartOfAccount, VoucherType
from hr.models import Employee
from .models import SaleInvoice, SaleReturn, SaleReturnItem
from inventory.models import Batch

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
        )
        VoucherType.objects.create(name="Sale", code="SAL")
        self.user = User.objects.create_user("user@example.com", "pass")

    def test_voucher_linked_on_creation(self):
        invoice = SaleInvoice.objects.create(
            invoice_no="INV-001",
            date=date.today(),
            customer=self.customer,
            warehouse=self.warehouse,
            total_amount=10,
            sub_total=10,
            discount=0,
            tax=0,
            grand_total=10,
            paid_amount=10,
            net_amount=10,
            payment_method="Cash",
            status="Paid",
        )
        self.assertIsNotNone(invoice.voucher)

    def test_status_action_updates_status_and_delivery_man(self):
        invoice = SaleInvoice.objects.create(
            invoice_no="INV-002",
            date=date.today(),
            customer=self.customer,
            warehouse=self.warehouse,
            total_amount=10,
            sub_total=10,
            discount=0,
            tax=0,
            grand_total=10,
            paid_amount=0,
            net_amount=10,
            payment_method="Cash",
            status="Pending",
        )
        self.client.force_authenticate(user=self.user)
        employee = Employee.objects.create(name="Delivery", phone="123")
        patch_data = {"status": "Paid", "delivery_man_id": employee.id}
        patch_resp = self.client.patch(
            f"/sales/invoices/{invoice.id}/status/", patch_data, format="json"
        )
        self.assertEqual(patch_resp.status_code, 200, patch_resp.data)
        self.assertEqual(patch_resp.data["status"], "Paid")
        self.assertEqual(patch_resp.data["delivery_man_id"], employee.id)


class SaleReturnVoucherTest(APITestCase):
    def setUp(self):
        asset = AccountType.objects.create(name="ASSET")
        income = AccountType.objects.create(name="INCOME")
        VoucherType.objects.create(name="Sale", code="SAL")
        VoucherType.objects.create(name="Sale Return", code="SRN")

        self.cash_account = ChartOfAccount.objects.create(
            name="Cash", code="1001", account_type=asset
        )
        self.customer_account = ChartOfAccount.objects.create(
            name="Customer", code="1002", account_type=asset
        )
        self.sales_account = ChartOfAccount.objects.create(
            name="Sales", code="4000", account_type=income
        )

        self.branch = Branch.objects.create(name="Main", address="addr")
        self.warehouse = Warehouse.objects.create(
            name="W1",
            branch=self.branch,
            default_sales_account=self.sales_account,
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
            quantity=0,
            warehouse=self.warehouse,
        )

        self.customer = Party.objects.create(
            name="Cust",
            address="addr",
            phone="123",
            party_type="customer",
            chart_of_account=self.customer_account,
        )

    def _create_invoice(self, method):
        return SaleInvoice.objects.create(
            invoice_no=f"INV-{method}",
            date=date.today(),
            customer=self.customer,
            warehouse=self.warehouse,
            total_amount=50,
            sub_total=50,
            discount=0,
            tax=0,
            grand_total=50,
            paid_amount=50 if method == "Cash" else 0,
            net_amount=50,
            payment_method=method,
            status="Paid" if method == "Cash" else "Pending",
        )

    def test_cash_sale_return_accounts_and_inventory(self):
        invoice = self._create_invoice("Cash")
        sr = SaleReturn.objects.create(
            return_no="SR1",
            date=date.today(),
            invoice=invoice,
            customer=self.customer,
            warehouse=self.warehouse,
            total_amount=50,
        )
        SaleReturnItem.objects.create(
            return_invoice=sr,
            product=self.product,
            batch_number="B1",
            expiry_date=date.today(),
            quantity=5,
            rate=10,
            discount1=0,
            discount2=0,
            amount=50,
            net_amount=50,
        )
        sr.save()

        self.batch.refresh_from_db()
        self.assertEqual(self.batch.quantity, 5)
        debit = sr.voucher.entries.get(debit__gt=0)
        credit = sr.voucher.entries.get(credit__gt=0)
        self.assertEqual(debit.account, self.sales_account)
        self.assertEqual(credit.account, self.cash_account)
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.current_balance, 0)

    def test_credit_sale_return_accounts_and_party_balance(self):
        self.customer.current_balance = 50
        self.customer.save()
        invoice = self._create_invoice("Credit")
        sr = SaleReturn.objects.create(
            return_no="SR2",
            date=date.today(),
            invoice=invoice,
            customer=self.customer,
            warehouse=self.warehouse,
            total_amount=20,
        )
        SaleReturnItem.objects.create(
            return_invoice=sr,
            product=self.product,
            batch_number="B1",
            expiry_date=date.today(),
            quantity=2,
            rate=10,
            discount1=0,
            discount2=0,
            amount=20,
            net_amount=20,
        )
        sr.save()

        self.batch.refresh_from_db()
        self.assertEqual(self.batch.quantity, 2)
        debit = sr.voucher.entries.get(debit__gt=0)
        credit = sr.voucher.entries.get(credit__gt=0)
        self.assertEqual(debit.account, self.sales_account)
        self.assertEqual(credit.account, self.customer_account)
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.current_balance, 30)
