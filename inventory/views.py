import json

from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import Batch, PriceList, StockMovement


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


@csrf_exempt
@require_http_methods(["POST"])
def stock_audit(request):
    """Adjust stock levels based on provided physical counts.

    Expects a JSON payload with a ``batches`` key containing objects with
    ``batch_id`` and ``count``. For each batch the quantity is updated and a
    ``StockMovement`` entry with ``movement_type='ADJUST'`` is recorded.
    """

    try:
        payload = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    results = []
    for item in payload.get("batches", []):
        batch_id = item.get("batch_id")
        count = item.get("count")
        if batch_id is None or count is None:
            continue

        batch = get_object_or_404(Batch, pk=batch_id)
        variance = int(count) - batch.quantity

        if variance != 0:
            batch.quantity = count
            batch.save()
            StockMovement.objects.create(
                batch=batch,
                movement_type="ADJUST",
                quantity=variance,
                reason="Stock audit adjustment",
            )

        results.append(
            {"batch_id": batch_id, "variance": variance, "new_quantity": batch.quantity}
        )

    return JsonResponse({"results": results})
