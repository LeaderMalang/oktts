from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
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

    def get_queryset(self):
        qs = super().get_queryset()

        status_param = self.request.query_params.get("status")
        start_date = self.request.query_params.get("startDate") or self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("endDate") or self.request.query_params.get("end_date")
        search_term = self.request.query_params.get("searchTerm") or self.request.query_params.get("search")

        if status_param:
            qs = qs.filter(status__iexact=status_param)
        if start_date:
            qs = qs.filter(date__gte=start_date)
        if end_date:
            qs = qs.filter(date__lte=end_date)
        if search_term:
            qs = qs.filter(
                Q(invoice_no__icontains=search_term)
                | Q(company_invoice_number__icontains=search_term)
                | Q(supplier__name__icontains=search_term)
            )

        return qs

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

    def get_queryset(self):
        qs = super().get_queryset()

        status_param = self.request.query_params.get("status")
        start_date = self.request.query_params.get("startDate") or self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("endDate") or self.request.query_params.get("end_date")
        search_term = self.request.query_params.get("searchTerm") or self.request.query_params.get("search")

        if status_param and hasattr(self.queryset.model, "status"):
            qs = qs.filter(status__iexact=status_param)
        if start_date:
            qs = qs.filter(date__gte=start_date)
        if end_date:
            qs = qs.filter(date__lte=end_date)
        if search_term:
            qs = qs.filter(
                Q(return_no__icontains=search_term)
                | Q(supplier__name__icontains=search_term)
            )

        return qs


class InvestorTransactionViewSet(viewsets.ModelViewSet):
    queryset = InvestorTransaction.objects.all()
    serializer_class = InvestorTransactionSerializer
