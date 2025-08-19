from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import PaymentSchedule
from .serializers import PaymentScheduleSerializer
from utils.voucher import create_voucher_for_transaction


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
                    voucher = create_voucher_for_transaction(
                        voucher_type_code="PIN",
                        date=invoice.date,
                        amount=schedule.amount,
                        narration=f"Installment payment for Purchase Invoice {invoice.invoice_no}",
                        debit_account=invoice.supplier.chart_of_account,
                        credit_account=invoice.warehouse.default_cash_account or invoice.warehouse.default_bank_account,
                        created_by=getattr(invoice, "created_by", None),
                        branch=getattr(invoice, "branch", None),
                    )
                else:
                    voucher = create_voucher_for_transaction(
                        voucher_type_code="SIN",
                        date=invoice.date,
                        amount=schedule.amount,
                        narration=f"Installment payment for Sale Invoice {invoice.invoice_no}",
                        debit_account=invoice.warehouse.default_cash_account or invoice.warehouse.default_bank_account,
                        credit_account=invoice.customer.chart_of_account,
                        created_by=getattr(invoice, "created_by", None),
                        branch=getattr(invoice, "branch", None),
                    )
                schedule.voucher = voucher
                schedule.save(update_fields=["voucher"])
        serializer = self.get_serializer(schedule)
        return Response(serializer.data)
