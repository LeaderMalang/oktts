from django.shortcuts import render
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view
from rest_framework.response import Response
from voucher.models import VoucherEntry
from .ratios import current_ratio, gross_profit_margin


@require_http_methods(["GET"])
def report_dashboard(request):
    return render(request, 'report/dashboard.html')


@api_view(["GET"])
def financial_ratios(request):
    entries = VoucherEntry.objects.all()
    data = {
        "currentRatio": current_ratio(entries=entries),
        "grossProfitMargin": gross_profit_margin(entries=entries),
    }
    return Response(data)
