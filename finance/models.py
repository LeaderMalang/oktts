from datetime import timedelta
from django.db import models


class PaymentTerm(models.Model):
    """Defines payment terms such as installment count and interval."""

    name = models.CharField(max_length=100)
    installments = models.PositiveIntegerField(default=1)
    interval_days = models.PositiveIntegerField(default=30)

    def __str__(self):  # pragma: no cover - display helper
        return self.name


class PaymentSchedule(models.Model):
    """Represents a scheduled payment for an invoice."""

    STATUS_CHOICES = (("Pending", "Pending"), ("Paid", "Paid"))

    term = models.ForeignKey(PaymentTerm, on_delete=models.CASCADE)
    purchase_invoice = models.ForeignKey(
        'purchase.PurchaseInvoice',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='payment_schedules',
    )
    sale_invoice = models.ForeignKey(
        'sale.SaleInvoice',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='payment_schedules',
    )
    due_date = models.DateField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    voucher = models.ForeignKey(
        'voucher.Voucher',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    def __str__(self):  # pragma: no cover - display helper
        invoice = self.purchase_invoice or self.sale_invoice
        return f"Schedule for {invoice} due {self.due_date}" if invoice else "Schedule"
