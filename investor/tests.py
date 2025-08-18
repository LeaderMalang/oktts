from datetime import date

from rest_framework.test import APITestCase

from voucher.models import AccountType, ChartOfAccount
from inventory.models import Party
from .models import InvestorTransaction


def create_investor():
    asset = AccountType.objects.create(name="ASSET")
    account = ChartOfAccount.objects.create(
        name="Investor", code="3000", account_type=asset
    )
    return Party.objects.create(
        name="Inv",
        address="addr",
        phone="123",
        party_type="investor",
        chart_of_account=account,
    )


class InvestorLedgerTests(APITestCase):
    def test_ledger_endpoint(self):
        investor = create_investor()
        InvestorTransaction.objects.create(
            investor=investor,
            amount=100,
            transaction_type="IN",
            date=date.today(),
            description="Invest",
        )
        InvestorTransaction.objects.create(
            investor=investor,
            amount=40,
            transaction_type="OUT",
            date=date.today(),
            description="Payout",
        )
        resp = self.client.get(f"/investor/investors/{investor.id}/ledger/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 2)
        self.assertEqual(resp.data[-1]["balance"], 60)

    def test_ledger_endpoint_invalid_investor(self):
        resp = self.client.get("/investor/investors/999/ledger/")
        self.assertEqual(resp.status_code, 404)

