from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import PurchaseInvoice, PurchaseReturn, InvestorTransaction
from .serializers import (
    PurchaseInvoiceSerializer,
    PurchaseReturnSerializer,
    InvestorTransactionSerializer,
)


class PurchaseInvoiceViewSet(viewsets.ModelViewSet):
    queryset = PurchaseInvoice.objects.all()
    serializer_class = PurchaseInvoiceSerializer

    @action(detail=False, methods=["get"], url_path="by-number/(?P<invoice_no>[^/.]+)")
    def retrieve_by_number(self, request, invoice_no=None):
        """Retrieve a purchase invoice using its invoice_no."""
        invoice = get_object_or_404(
            PurchaseInvoice.objects.all().prefetch_related("items"),
            invoice_no=invoice_no,
        )
        serializer = self.get_serializer(invoice)
        return Response(serializer.data)


class PurchaseReturnViewSet(viewsets.ModelViewSet):
    queryset = PurchaseReturn.objects.all()
    serializer_class = PurchaseReturnSerializer


class InvestorTransactionViewSet(viewsets.ModelViewSet):
    queryset = InvestorTransaction.objects.all()
    serializer_class = InvestorTransactionSerializer
