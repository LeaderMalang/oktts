"""Views for voucher and financial ledger endpoints."""

from decimal import Decimal

from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response

from inventory.models import Party
from .models import VoucherEntry


@api_view(["GET"])
def customer_ledger(request, party_id):
    """Return voucher history for a customer `Party`.

    The ledger is built from :class:`VoucherEntry` records tied to the
    party's chart of account. Entries are ordered by voucher date and a
    running balance is calculated server-side.
    """

    party = get_object_or_404(Party, pk=party_id, party_type="customer")

    if not party.chart_of_account:
        return Response({"party": party.id, "ledger": []})

    entries = (
        VoucherEntry.objects.filter(account=party.chart_of_account)
        .select_related("voucher")
        .order_by("voucher__date", "id")
    )

    balance = Decimal("0")
    ledger = []
    for entry in entries:
        balance += entry.debit - entry.credit
        ledger.append(
            {
                "date": entry.voucher.date,
                "description": entry.voucher.narration or entry.remarks,
                "debit": float(entry.debit),
                "credit": float(entry.credit),
                "balance": float(balance),
            }
        )

    return Response({"party": party.id, "party_name": party.name, "ledger": ledger})
