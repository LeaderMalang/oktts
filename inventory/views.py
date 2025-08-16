from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.db.models import Sum
from .models import PriceList, Batch, Product, Party


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


@require_http_methods(["GET"])
def product_list(request):
    """Return all products with camelCase keys."""
    products = Product.objects.values(
        "id",
        "name",
        "barcode",
        "company_id",
        "group_id",
        "distributor_id",
        "trade_price",
        "retail_price",
        "sales_tax_ratio",
        "fed_tax_ratio",
        "disable_sale_purchase",
    )
    data = [
        {
            "id": p["id"],
            "name": p["name"],
            "barcode": p["barcode"],
            "companyId": p["company_id"],
            "groupId": p["group_id"],
            "distributorId": p["distributor_id"],
            "tradePrice": float(p["trade_price"]),
            "retailPrice": float(p["retail_price"]),
            "salesTaxRatio": float(p["sales_tax_ratio"]),
            "fedTaxRatio": float(p["fed_tax_ratio"]),
            "disableSalePurchase": p["disable_sale_purchase"],
        }
        for p in products
    ]
    return JsonResponse(data, safe=False)


@require_http_methods(["GET"])
def party_list(request):
    """Return all parties with camelCase keys."""
    parties = Party.objects.values(
        "id",
        "name",
        "address",
        "phone",
        "party_type",
        "city_id",
        "area_id",
        "proprietor",
        "license_no",
        "license_expiry",
        "category",
        "latitude",
        "longitude",
        "credit_limit",
        "current_balance",
        "price_list",
    )
    data = [
        {
            "id": p["id"],
            "name": p["name"],
            "address": p["address"],
            "phone": p["phone"],
            "partyType": p["party_type"],
            "cityId": p["city_id"],
            "areaId": p["area_id"],
            "proprietor": p["proprietor"],
            "licenseNo": p["license_no"],
            "licenseExpiry": p["license_expiry"],
            "category": p["category"],
            "latitude": p["latitude"],
            "longitude": p["longitude"],
            "creditLimit": float(p["credit_limit"]) if p["credit_limit"] is not None else None,
            "currentBalance": float(p["current_balance"]) if p["current_balance"] is not None else None,
            "priceListId": int(p["price_list"]) if p["price_list"] and str(p["price_list"]).isdigit() else None,
        }
        for p in parties
    ]
    return JsonResponse(data, safe=False)
