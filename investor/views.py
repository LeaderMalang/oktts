from rest_framework import viewsets
from .models import InvestorTransaction
from .serializers import InvestorTransactionSerializer


class InvestorTransactionViewSet(viewsets.ModelViewSet):
    queryset = InvestorTransaction.objects.all()
    serializer_class = InvestorTransactionSerializer
