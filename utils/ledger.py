from decimal import Decimal

from utils.voucher import (
    post_composite_sales_voucher,
    post_composite_sales_return_voucher,
)


def post_sales_invoice_ledger(
    *,
    date,
    invoice_no: str,
    grand_total: Decimal,
    tax: Decimal,
    paid_amount: Decimal,
    sales_account,
    customer_account,
    cash_or_bank_account=None,
    created_by=None,
    branch=None,
):
    """Create ledger postings for a sale invoice."""
    return post_composite_sales_voucher(
        date=date,
        invoice_no=invoice_no,
        grand_total=Decimal(grand_total),
        tax=Decimal(tax or 0),
        paid_amount=Decimal(paid_amount or 0),
        sales_account=sales_account,
        customer_account=customer_account,
        cash_or_bank_account=cash_or_bank_account,
        created_by=created_by,
        branch=branch,
    )


def post_sales_return_ledger(
    *,
    date,
    return_no: str,
    total_amount: Decimal,
    tax: Decimal,
    sales_return_account,
    customer_account,
    cash_or_bank_account=None,
    refund_now: bool = False,
    created_by=None,
    branch=None,
):
    """Create ledger postings for a sale return."""
    return post_composite_sales_return_voucher(
        date=date,
        return_no=return_no,
        total_amount=Decimal(total_amount),
        tax=Decimal(tax or 0),
        sales_return_account=sales_return_account,
        customer_account=customer_account,
        cash_or_bank_account=cash_or_bank_account,
        refund_now=refund_now,
        created_by=created_by,
        branch=branch,
    )
