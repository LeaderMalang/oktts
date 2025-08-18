from django.shortcuts import render
from django.views.decorators.http import require_http_methods


@require_http_methods(["GET"])
def report_dashboard(request):
    return render(request, 'report/dashboard.html')
