from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import PaymentSchedule
from .serializers import PaymentScheduleSerializer


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
        return Response({"status": "paid"})
