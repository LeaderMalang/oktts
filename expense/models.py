from django.db import models
from datetime import datetime, time

from django.utils import timezone
from django_ledger.models import (
    AccountModel,
    JournalEntryModel,
    TransactionModel,
)
from utils.ledger import get_or_create_default_ledger


class ExpenseCategory(models.Model):
    """Represents a grouping for expenses tied to an account."""
    name = models.CharField(max_length=100, unique=True)
    chart_of_account = models.ForeignKey(AccountModel, on_delete=models.PROTECT)

    def __str__(self) -> str:

        return self.name


class Expense(models.Model):

    """An individual expense entry that posts to accounting via a journal entry."""
    date = models.DateField()
    category = models.ForeignKey(ExpenseCategory, on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField(blank=True)
    payment_account = models.ForeignKey(
        AccountModel, on_delete=models.PROTECT, related_name="expense_payments"
    )
    journal_entry = models.ForeignKey(
        JournalEntryModel, on_delete=models.SET_NULL, null=True, blank=True
    )

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)

        if is_new and self.category.chart_of_account and self.payment_account:
            ledger = get_or_create_default_ledger()
            if not ledger:
                return

            timestamp = timezone.make_aware(
                datetime.combine(self.date, time.min)
            )

            je = JournalEntryModel.objects.create(
                ledger=ledger,
                timestamp=timestamp,
                description=self.description or f"Expense for {self.category.name}",
            )

            TransactionModel.objects.bulk_create(
                [
                    TransactionModel(
                        journal_entry=je,
                        account=self.category.chart_of_account,
                        tx_type=TransactionModel.DEBIT,
                        amount=self.amount,
                        description=f"Expense - {self.category.name}",
                    ),
                    TransactionModel(
                        journal_entry=je,
                        account=self.payment_account,
                        tx_type=TransactionModel.CREDIT,
                        amount=self.amount,
                        description="Payment",
                    ),
                ]
            )

            self.journal_entry = je
            super().save(update_fields=["journal_entry"])

