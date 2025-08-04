from rest_framework import viewsets

from .models import PurchaseInvoice, PurchaseReturn, InvestorTransaction
from .serializers import (
    PurchaseInvoiceSerializer,
    PurchaseReturnSerializer,
    InvestorTransactionSerializer,
)


class PurchaseInvoiceViewSet(viewsets.ModelViewSet):
    queryset = PurchaseInvoice.objects.all()
    serializer_class = PurchaseInvoiceSerializer


class PurchaseReturnViewSet(viewsets.ModelViewSet):
    queryset = PurchaseReturn.objects.all()
    serializer_class = PurchaseReturnSerializer


class InvestorTransactionViewSet(viewsets.ModelViewSet):
    queryset = InvestorTransaction.objects.all()
    serializer_class = InvestorTransactionSerializer
