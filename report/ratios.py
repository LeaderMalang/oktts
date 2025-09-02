from decimal import Decimal
from django.db.models import Sum, F
from django_ledger.models import TransactionModel
from collections import defaultdict


def _sum_entries(entries, role_prefix, positive="debit"):
    """Return the summed balance for accounts with a given role prefix."""
    total = Decimal("0")
    for tx in entries.select_related("account"):
        if not tx.account.role.startswith(role_prefix):
            continue
        if tx.tx_type == TransactionModel.DEBIT:
            amt = tx.amount if positive == "debit" else -tx.amount
        else:
            amt = -tx.amount if positive == "debit" else tx.amount
        total += amt
    return total


def current_ratio(*, current_assets=None, current_liabilities=None, entries=None):
    """Calculate the current ratio.

    Either ``current_assets`` and ``current_liabilities`` can be provided directly,
    or a queryset of :class:`~django_ledger.models.TransactionModel` can be supplied via
    ``entries`` to derive the values from underlying accounting data.
    """
    if entries is not None:
        if current_assets is None:
            current_assets = _sum_entries(entries, "asset", positive="debit")
        if current_liabilities is None:
            current_liabilities = _sum_entries(entries, "lia", positive="credit")
    if not current_liabilities:
        return None
    return float(current_assets) / float(current_liabilities)


def gross_profit_margin(*, gross_profit=None, revenue=None, entries=None):
    """Calculate the gross profit margin.

    Parameters can be supplied directly or derived from ``entries``. When using
    ``entries``, all accounts whose role starts with ``inc`` are treated as
    revenue and all accounts starting with ``exp`` as cost of goods sold.
    """
    if entries is not None:
        if revenue is None:
            revenue = _sum_entries(entries, "inc", positive="credit")
        if gross_profit is None:
            expenses = _sum_entries(entries, "exp", positive="debit")
            gross_profit = revenue - expenses
    if not revenue:
        return None
    return float(gross_profit) / float(revenue)
