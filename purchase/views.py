import json
from decimal import Decimal

from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from inventory.models import Party

from .models import InvestorTransaction, PurchaseInvoice


# API endpoints for investor transactions


def _serialize_transaction(tx: InvestorTransaction) -> dict:
    return {
        "id": tx.id,
        "investor": tx.investor_id,
        "transaction_type": tx.transaction_type,
        "amount": str(tx.amount),
        "date": tx.date.isoformat(),
        "notes": tx.notes,
        "purchase_invoice": tx.purchase_invoice_id,
    }


@csrf_exempt
@require_http_methods(["GET", "POST"])
def investor_transaction_list(request):
    """List all transactions or create a new one."""

    if request.method == "GET":
        data = [_serialize_transaction(tx) for tx in InvestorTransaction.objects.all()]
        return JsonResponse(data, safe=False)

    payload = json.loads(request.body or "{}")
    investor = get_object_or_404(Party, pk=payload.get("investor"))
    invoice = None
    if payload.get("purchase_invoice"):
        invoice = get_object_or_404(PurchaseInvoice, pk=payload["purchase_invoice"])
    tx = InvestorTransaction.objects.create(
        investor=investor,
        transaction_type=payload.get("transaction_type"),
        amount=Decimal(str(payload.get("amount", "0"))),
        date=payload.get("date"),
        notes=payload.get("notes", ""),
        purchase_invoice=invoice,
    )
    return JsonResponse(_serialize_transaction(tx), status=201)


@csrf_exempt
@require_http_methods(["GET", "PUT", "DELETE"])
def investor_transaction_detail(request, pk: int):
    """Retrieve, update or delete a transaction."""

    tx = get_object_or_404(InvestorTransaction, pk=pk)

    if request.method == "GET":
        return JsonResponse(_serialize_transaction(tx))

    if request.method == "DELETE":
        tx.delete()
        return JsonResponse({}, status=204)

    payload = json.loads(request.body or "{}")
    if "investor" in payload:
        tx.investor = get_object_or_404(Party, pk=payload["investor"])
    if "purchase_invoice" in payload:
        invoice_id = payload["purchase_invoice"]
        tx.purchase_invoice = (
            get_object_or_404(PurchaseInvoice, pk=invoice_id) if invoice_id else None
        )
    for field in ["transaction_type", "date", "notes"]:
        if field in payload:
            setattr(tx, field, payload[field])
    if "amount" in payload:
        tx.amount = Decimal(str(payload["amount"]))
    tx.save()
    return JsonResponse(_serialize_transaction(tx))

