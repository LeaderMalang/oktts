"""Helpers for posting expense ledger entries."""

from voucher.models import VoucherType
from utils.voucher import create_voucher_for_transaction


def post_expense_ledger(
    *,
    date,
    amount,
    narration,
    expense_account,
    payment_account,
    created_by=None,
    branch=None,
):
    """Post ledger entries for an expense.

    Creates a voucher (type ``EXP``) debiting the expense account and
    crediting the payment account.
    Returns the created :class:`voucher.models.Voucher`.
    """

    # Ensure expense voucher type exists
    vt, _ = VoucherType.objects.get_or_create(code="EXP", defaults={"name": "Expense"})

    return create_voucher_for_transaction(
        voucher_type_code=vt.code,
        date=date,
        amount=amount,
        narration=narration,
        debit_account=expense_account,
        credit_account=payment_account,
        created_by=created_by,
        branch=branch,
    )

