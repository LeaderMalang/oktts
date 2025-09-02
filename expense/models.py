from django.db import models

from voucher.models import ChartOfAccount
from .ledger import post_expense_ledger


class ExpenseCategory(models.Model):
    """Represents a grouping for expenses tied to a chart of account."""
    name = models.CharField(max_length=100, unique=True)
    chart_of_account = models.ForeignKey(ChartOfAccount, on_delete=models.PROTECT)

    def __str__(self) -> str:

        return self.name


class Expense(models.Model):

    """An individual expense entry that posts to accounting via a voucher."""
    date = models.DateField()
    category = models.ForeignKey(ExpenseCategory, on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField(blank=True)
    payment_account = models.ForeignKey(
        ChartOfAccount, on_delete=models.PROTECT, related_name="expense_payments"
    )

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)

        if is_new and self.category.chart_of_account and self.payment_account:
            post_expense_ledger(
                date=self.date,
                amount=self.amount,
                narration=self.description or f"Expense for {self.category.name}",
                expense_account=self.category.chart_of_account,
                payment_account=self.payment_account,
                created_by=getattr(self, "created_by", None),
                branch=getattr(self, "branch", None),
            )

