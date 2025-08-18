from datetime import date

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from voucher.models import AccountType, ChartOfAccount, VoucherType
from .models import ExpenseCategory, Expense


def setup_expense_entities():
    asset = AccountType.objects.create(name="ASSET")
    expense_type = AccountType.objects.create(name="EXPENSE")
    category_account = ChartOfAccount.objects.create(
        name="Travel", code="6000", account_type=expense_type
    )
    cash_account = ChartOfAccount.objects.create(
        name="Cash", code="1000", account_type=asset
    )
    category = ExpenseCategory.objects.create(
        name="Travel", chart_of_account=category_account
    )
    return {
        "category": category,
        "cash_account": cash_account,
    }


class ExpenseTests(APITestCase):
    def setUp(self):
        data = setup_expense_entities()
        self.category = data["category"]
        self.cash_account = data["cash_account"]
        VoucherType.objects.create(code="EXP", name="Expense")

    def test_expense_creates_voucher_on_save(self):
        expense = Expense.objects.create(
            date=date.today(),
            category=self.category,
            amount=100,
            description="Taxi",
            payment_account=self.cash_account,
        )
        self.assertIsNotNone(expense.voucher)

    def test_expense_create_api_invalid(self):
        response = self.client.post(
            "/expenses/expenses/",
            {"category": self.category.id},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

