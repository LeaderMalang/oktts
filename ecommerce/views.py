from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Order
from .serializers import OrderSerializer
from sale.serializers import SaleInvoiceSerializer
from setting.models import Warehouse


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().prefetch_related("items")
    serializer_class = OrderSerializer

    @action(detail=True, methods=["post"])
    def confirm(self, request, pk=None):
        order = self.get_object()
        warehouse = Warehouse.objects.get(pk=request.data.get("warehouse"))
        payment_method = request.data.get("payment_method")
        invoice = order.confirm(warehouse, payment_method)
        serializer = SaleInvoiceSerializer(invoice)
        return Response(serializer.data)
