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

    @action(
        detail=False,
        methods=["get"],
        url_path="customer/(?P<customer_id>[^/.]+)",
    )
    def list_by_customer(self, request, customer_id=None):
        queryset = self.queryset.filter(customer_id=customer_id)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)


        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def confirm(self, request, pk=None):
        order = self.get_object()
        warehouse = Warehouse.objects.get(pk=request.data.get("warehouse"))
        payment_method = request.data.get("payment_method")
        invoice = order.confirm(warehouse, payment_method)
        serializer = SaleInvoiceSerializer(invoice)
        return Response(serializer.data)
