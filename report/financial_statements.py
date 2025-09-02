"""Utility helpers for financial statement reports.

These services aggregate :class:`~django_ledger.models.TransactionModel`
balances by their related account roles for a given period.
"""

from __future__ import annotations

from datetime import date
from decimal import Decimal
from typing import Dict

from django_ledger.models import TransactionModel
from collections import defaultdict


def account_type_balances(*, start_date: date, end_date: date) -> Dict[str, Decimal]:
    """Return net balances grouped by account role.

    Balances are calculated as ``debits - credits`` for all transactions whose
    journal entry timestamp falls within ``start_date`` and ``end_date``
    inclusive. The returned dictionary maps account ``role`` values to their
    computed totals.
    """

    qs = TransactionModel.objects.filter(
        journal_entry__timestamp__date__gte=start_date,
        journal_entry__timestamp__date__lte=end_date,
    ).select_related("account")

    totals: Dict[str, Decimal] = defaultdict(Decimal)
    for tx in qs:
        role = tx.account.role
        if tx.tx_type == TransactionModel.DEBIT:
            totals[role] += tx.amount
        else:
            totals[role] -= tx.amount

    return dict(totals)


__all__ = ["account_type_balances"]

