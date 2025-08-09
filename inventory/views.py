from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.utils.dateparse import parse_date
from .models import PriceList, StockMovement


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
def stock_movement_list(request):
    movements = StockMovement.objects.select_related('batch__product').all()

    product_id = request.GET.get('productId')
    if product_id:
        movements = movements.filter(batch__product_id=product_id)

    start_date_str = request.GET.get('startDate')
    if start_date_str:
        start_date = parse_date(start_date_str)
        if start_date:
            movements = movements.filter(timestamp__date__gte=start_date)

    end_date_str = request.GET.get('endDate')
    if end_date_str:
        end_date = parse_date(end_date_str)
        if end_date:
            movements = movements.filter(timestamp__date__lte=end_date)

    data = [
        {
            'id': m.id,
            'productId': m.batch.product_id,
            'batchNo': m.batch.batch_number,
            'movementType': m.movement_type,
            'quantity': m.quantity,
            'reason': m.reason,
            'timestamp': m.timestamp.isoformat(),
        }
        for m in movements.order_by('-timestamp')
    ]

    return JsonResponse({'movements': data})
