from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import FinancialYear, PaymentSchedule
from .serializers import FinancialYearSerializer, PaymentScheduleSerializer
from utils.ledger import post_simple_entry


class PaymentScheduleViewSet(viewsets.ModelViewSet):
    queryset = PaymentSchedule.objects.all()
    serializer_class = PaymentScheduleSerializer

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        schedule = self.get_object()
        if schedule.status != "Paid":
            schedule.status = "Paid"
            schedule.save(update_fields=["status"])
            invoice = schedule.purchase_invoice or schedule.sale_invoice
            if invoice:
                invoice.paid_amount = (invoice.paid_amount or 0) + schedule.amount
                if invoice.paid_amount >= invoice.grand_total:
                    invoice.status = "Paid"
                invoice.save(update_fields=["paid_amount", "status"])

                if schedule.purchase_invoice:
                    je = post_simple_entry(
                        date=invoice.date,
                        amount=schedule.amount,
                        narration=f"Installment payment for Purchase Invoice {invoice.invoice_no}",
                        debit_account=invoice.supplier.chart_of_account,
                        credit_account=invoice.warehouse.default_cash_account or invoice.warehouse.default_bank_account,
                    )
                else:
                    je = post_simple_entry(
                        date=invoice.date,
                        amount=schedule.amount,
                        narration=f"Installment payment for Sale Invoice {invoice.invoice_no}",
                        debit_account=invoice.warehouse.default_cash_account or invoice.warehouse.default_bank_account,
                        credit_account=invoice.customer.chart_of_account,
                    )
                schedule.journal_entry = je
                schedule.save(update_fields=["journal_entry"])
        serializer = self.get_serializer(schedule)
        return Response(serializer.data)


class FinancialYearViewSet(viewsets.ModelViewSet):
    queryset = FinancialYear.objects.all()
    serializer_class = FinancialYearSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        year = self.get_object()
        year.activate()
        serializer = self.get_serializer(year)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def close(self, request, pk=None):
        year = self.get_object()
        year.is_active = False
        year.save(update_fields=["is_active"])
        serializer = self.get_serializer(year)
        return Response(serializer.data)
