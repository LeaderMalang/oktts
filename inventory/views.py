from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from rest_framework import viewsets

from .models import PriceList, Party
from .serializers import PartySerializer


@require_http_methods(["GET"])
def price_list_list(request):
    data = list(PriceList.objects.values('id', 'name', 'description'))
    return JsonResponse({'price_lists': data})


@require_http_methods(["GET"])
def price_list_detail(request, pk):
    price_list = get_object_or_404(PriceList, pk=pk)
    items = price_list.items.select_related('product').values(
        'product__id', 'product__name', 'custom_price'
    )
    data = {
        'id': price_list.id,
        'name': price_list.name,
        'description': price_list.description,
        'items': list(items)
    }
    return JsonResponse(data)


class PartyViewSet(viewsets.ModelViewSet):
    """API endpoint for managing parties."""

    queryset = Party.objects.all()
    serializer_class = PartySerializer
