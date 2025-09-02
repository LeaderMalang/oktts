from decimal import Decimal
from voucher.models import Voucher, VoucherType, ChartOfAccount
from setting.constants import TAX_RECEIVABLE_ACCOUNT_CODE


def post_purchase_invoice_ledger(*, date, invoice_no, grand_total, tax, paid_amount,
                                 purchase_account, supplier_account,
                                 cash_or_bank_account=None, created_by=None, branch=None):
    """Record ledger entries for a purchase invoice.

    The helper creates a voucher with balanced debit/credit lines:
    - DR inventory (net of tax)
    - DR tax receivable (if any)
    - CR supplier for the outstanding amount
    - CR cash/bank for any immediate payment
    """
    grand_total = Decimal(grand_total)
    tax = Decimal(tax or 0)
    paid_amount = Decimal(paid_amount or 0)

    vt, _ = VoucherType.objects.get_or_create(code="PUR", defaults={"name": "Purchase"})

    entries = []
    net_amount = grand_total - tax
    entries.append({
        "account": purchase_account,
        "debit": net_amount,
        "credit": Decimal("0"),
        "remarks": "Purchase (net)",
    })

    if tax > 0:
        tax_account = ChartOfAccount.objects.get(code=TAX_RECEIVABLE_ACCOUNT_CODE)
        entries.append({
            "account": tax_account,
            "debit": tax,
            "credit": Decimal("0"),
            "remarks": "Input Tax",
        })

    supplier_credit = grand_total - paid_amount
    if supplier_credit > 0:
        entries.append({
            "account": supplier_account,
            "debit": Decimal("0"),
            "credit": supplier_credit,
            "remarks": "Credit to Supplier",
        })

    if paid_amount > 0:
        if cash_or_bank_account is None:
            raise ValueError("Cash/Bank account required when paid_amount > 0.")
        entries.append({
            "account": cash_or_bank_account,
            "debit": Decimal("0"),
            "credit": paid_amount,
            "remarks": "Cash/Bank payment",
        })

    voucher = Voucher.create_with_entries(
        voucher_type=vt,
        date=date,
        narration=f"Auto-ledger for Purchase Invoice {invoice_no}",
        created_by=created_by,
        entries=entries,
        branch=branch,
    )
    return voucher


def post_purchase_return_ledger(*, date, return_no, total_amount, tax,
                                purchase_return_account, supplier_account,
                                cash_or_bank_account=None, refund_now=False,
                                created_by=None, branch=None):
    """Record ledger entries for a purchase return."""
    total_amount = Decimal(total_amount or 0)
    tax = Decimal(tax or 0)
    vt, _ = VoucherType.objects.get_or_create(code="PRN", defaults={"name": "Purchase Return"})

    entries = []
    debit_account = cash_or_bank_account if refund_now else supplier_account
    debit_remarks = "Supplier cash refund" if refund_now else "Supplier credit note"
    entries.append({
        "account": debit_account,
        "debit": total_amount,
        "credit": Decimal("0"),
        "remarks": debit_remarks,
    })

    net = total_amount - tax
    entries.append({
        "account": purchase_return_account,
        "debit": Decimal("0"),
        "credit": net,
        "remarks": "Purchase return (net)",
    })

    if tax > 0:
        tax_account = ChartOfAccount.objects.get(code=TAX_RECEIVABLE_ACCOUNT_CODE)
        entries.append({
            "account": tax_account,
            "debit": Decimal("0"),
            "credit": tax,
            "remarks": "Reverse input tax",
        })

    voucher = Voucher.create_with_entries(
        voucher_type=vt,
        date=date,
        narration=f"Auto-ledger for Purchase Return {return_no}",
        created_by=created_by,
        entries=entries,
        branch=branch,
    )
    return voucher
