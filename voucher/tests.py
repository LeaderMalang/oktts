
from datetime import date
from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from voucher.models import AccountType, ChartOfAccount, Voucher, VoucherType
from voucher.test_utils import assert_ledger_entries


User = get_user_model()


class JournalVoucherTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("user@example.com", "pass")
        self.client.force_authenticate(self.user)

        asset = AccountType.objects.create(name="ASSET")
        income = AccountType.objects.create(name="INCOME")

        self.cash = ChartOfAccount.objects.create(
            name="Cash", code="CASH", account_type=asset
        )
        self.sales = ChartOfAccount.objects.create(
            name="Sales", code="SALES", account_type=income
        )


        VoucherType.objects.get_or_create(
            code=VoucherType.JOURNAL, defaults={"name": "Journal"}
        )

    def test_create_journal_voucher(self):
        response = self.client.post(
            "/voucher/journal/",
            {
                "date": date.today().isoformat(),
                "narration": "Sale entry",
                "entries": [
                    {
                        "account": self.cash.id,
                        "debit": "100.00",
                        "credit": "0",
                        "remarks": "cash",
                    },
                    {
                        "account": self.sales.id,
                        "debit": "0",
                        "credit": "100.00",
                        "remarks": "sales",
                    },
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        voucher = Voucher.objects.get(id=response.data["id"])
        self.assertEqual(voucher.amount, Decimal("100.00"))
        assert_ledger_entries(
            self,
            voucher,
            [
                (self.cash, Decimal("100.00"), 0),
                (self.sales, 0, Decimal("100.00")),
            ],
        )

    def test_reject_unbalanced_entries(self):
        response = self.client.post(
            "/voucher/journal/",
            {
                "date": date.today().isoformat(),
                "narration": "Bad entry",
                "entries": [
                    {"account": self.cash.id, "debit": "100", "credit": "0"},
                    {"account": self.sales.id, "debit": "0", "credit": "90"},
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)


