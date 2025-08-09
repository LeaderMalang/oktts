from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.db.models import Sum
from .models import PriceList, Batch


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


@require_http_methods(["GET"])
def inventory_levels(request):
    """Return aggregated stock levels per product."""
    levels = (
        Batch.objects.values("product__id", "product__name")
        .annotate(total_stock=Sum("quantity"))
        .order_by("product__id")
    )
    data = [
        {
            "product": {"id": item["product__id"], "name": item["product__name"]},
            "totalStock": item["total_stock"] or 0,
        }
        for item in levels
    ]
    return JsonResponse({"levels": data})
