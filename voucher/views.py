from rest_framework import viewsets

from .models import ChartOfAccount
from .serializers import ChartOfAccountSerializer


class ChartOfAccountViewSet(viewsets.ModelViewSet):
    """API endpoint for managing chart of accounts."""

    queryset = ChartOfAccount.objects.all()
    serializer_class = ChartOfAccountSerializer
