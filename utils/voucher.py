from voucher.models import Voucher, VoucherEntry, VoucherType
from django.contrib.auth import get_user_model

User = get_user_model()


def create_voucher_for_transaction(
    *,
    voucher_type_code,
    date,
    amount,
    narration,
    debit_account,
    credit_account,
    created_by=None,
    branch=None
):
    """
    Creates a voucher and two entries (debit & credit) for double-entry accounting.

    Params:
        - voucher_type_code (e.g., 'PUR', 'SAL')
        - date
        - amount
        - narration
        - debit_account (ChartOfAccount instance)
        - credit_account (ChartOfAccount instance)
        - created_by (User)
        - branch (optional)

    Returns: Voucher instance
    """

    voucher_type = VoucherType.objects.get(code=voucher_type_code)

    voucher = Voucher.objects.create(
        voucher_type=voucher_type,
        date=date,
        amount=amount,
        narration=narration,
        created_by=created_by or User.objects.first(),
        branch=branch,
        status='PENDING'
    )

    VoucherEntry.objects.create(
        voucher=voucher,
        account=debit_account,
        debit=amount,
        credit=0,
        remarks=f"Debit {debit_account.name}"
    )

    VoucherEntry.objects.create(
        voucher=voucher,
        account=credit_account,
        debit=0,
        credit=amount,
        remarks=f"Credit {credit_account.name}"
    )

    return voucher
