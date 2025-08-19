"""Tests for ledger endpoints in the voucher app."""

from datetime import date

from rest_framework.test import APITestCase

from voucher.models import (
    AccountType,
    ChartOfAccount,
    Voucher,
    VoucherEntry,
    VoucherType,
)


class LedgerViewTests(APITestCase):
    def setUp(self):
        asset = AccountType.objects.create(name="ASSET")
        income = AccountType.objects.create(name="INCOME")

        self.cash = ChartOfAccount.objects.create(
            name="Cash", code="CASH", account_type=asset
        )
        self.sales = ChartOfAccount.objects.create(
            name="Sales", code="SALES", account_type=income
        )

        self.voucher_type = VoucherType.objects.create(name="JV", code="JV")

    def _create_entry(self, v_date, debit=0, credit=0, remarks=""):
        """Create a voucher with matching entries for target accounts."""

        voucher = Voucher.objects.create(
            voucher_type=self.voucher_type,
            date=v_date,
            amount=debit or credit,
            narration=remarks,
        )

        # Entry for the cash account under test
        VoucherEntry.objects.create(
            voucher=voucher,
            account=self.cash,
            debit=debit,
            credit=credit,
            remarks=remarks,
        )
        # Counter entry to balance the voucher
        VoucherEntry.objects.create(
            voucher=voucher,
            account=self.sales,
            debit=credit,
            credit=debit,
            remarks=remarks,
        )

    def test_ledger_returns_ordered_entries_with_running_balance(self):
        """Ledger endpoint should order by date and compute running balances."""

        self._create_entry(date(2023, 1, 1), debit=100, remarks="deposit")
        # Two vouchers on the same day to ensure ordering by ID
        self._create_entry(date(2023, 1, 2), credit=30, remarks="withdrawal")
        self._create_entry(date(2023, 1, 2), debit=50, remarks="deposit2")

        resp = self.client.get(f"/voucher/ledger/{self.cash.id}/")
        self.assertEqual(resp.status_code, 200)

        ledger = resp.data["ledger"]
        self.assertEqual(len(ledger), 3)

        # Ensure entries are ordered and running balance is correct
        self.assertEqual(ledger[0]["debit"], 100.0)
        self.assertEqual(ledger[0]["balance"], 100.0)

        self.assertEqual(ledger[1]["credit"], 30.0)
        self.assertEqual(ledger[1]["balance"], 70.0)

        self.assertEqual(ledger[2]["debit"], 50.0)
        self.assertEqual(ledger[2]["balance"], 120.0)

