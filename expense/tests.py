from datetime import date
from decimal import Decimal

from django.test import TestCase

from voucher.models import AccountType, ChartOfAccount, VoucherType
from voucher.test_utils import assert_ledger_entries

from .models import Expense, ExpenseCategory


class ExpenseVoucherTests(TestCase):
    def setUp(self):
        expense_type = AccountType.objects.create(name="EXPENSE")
        asset_type = AccountType.objects.create(name="ASSET")
        self.expense_account = ChartOfAccount.objects.create(
            name="Office Supplies", code="5000", account_type=expense_type
        )
        self.cash_account = ChartOfAccount.objects.create(
            name="Cash", code="1000", account_type=asset_type
        )
        self.category = ExpenseCategory.objects.create(
            name="Supplies", chart_of_account=self.expense_account
        )
        VoucherType.objects.create(name="Expense", code="EXP")

    def test_expense_posts_ledger_entries(self):
        exp = Expense.objects.create(
            date=date.today(),
            category=self.category,
            amount=25,
            description="Stationery",
            payment_account=self.cash_account,
        )
        self.assertIsNotNone(exp.voucher)
        assert_ledger_entries(
            self,
            exp.voucher,
            [
                (self.expense_account, Decimal("25"), Decimal("0")),
                (self.cash_account, Decimal("0"), Decimal("25")),
            ],
        )
