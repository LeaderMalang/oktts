from django.shortcuts import render, get_object_or_404, redirect

from django.urls import reverse
from django.contrib import messages
from django.views.decorators.http import require_http_methods
from .models import SaleInvoice, SaleInvoiceItem
from .forms import SaleInvoiceForm,SaleInvoiceItemForm


@require_http_methods(["GET"])
def sale_invoice_list(request):
    sales = (
        SaleInvoice.objects.select_related(
            'customer',
            'salesman',
            'booking_man_id',
            'supplying_man_id',
            'delivery_man_id',
            'city_id',
            'area_id',
        ).all()
    )
    return render(request, 'invoice/sale_list.html', {'sales': sales})

@require_http_methods(["GET", "POST"])
def sale_invoice_create(request):
    if request.method == 'POST':
        sale=SaleInvoice()
        form = SaleInvoiceForm(request.POST,instance=sale)
        formset = SaleInvoiceItemForm(request.POST,instance=sale)
        if form.is_valid() and formset.is_valid():
            sale = form.save()
            formset.instance = sale
            formset.save()
            messages.success(request, "Sale invoice created.")
            return redirect(reverse('sale_detail', args=[sale.pk]))
    else:
        sale=SaleInvoice()
        form = SaleInvoiceForm(instance=sale)
        formset = SaleInvoiceItemForm(instance=sale)
        
    return render(request, 'invoice/sale_form.html', {'form': form, 'formset': formset})

@require_http_methods(["GET", "POST"])
def sale_invoice_edit(request, pk):
    sale = get_object_or_404(SaleInvoice, pk=pk)
    if request.method == 'POST':
        form = SaleInvoiceForm(request.POST, instance=sale)
        formset = SaleInvoiceItemForm(request.POST, instance=sale)
        if form.is_valid() and formset.is_valid():
            form.save()
            formset.save()
            messages.success(request, "Sale invoice updated.")
            return redirect(reverse('sale_detail', args=[sale.pk]))
    else:
        form = SaleInvoiceForm(instance=sale)
        formset = SaleInvoiceItemForm(instance=sale)
    return render(request, 'invoice/sale_form.html', {'form': form, 'formset': formset})

@require_http_methods(["GET"])
def sale_invoice_detail(request, pk):
    invoice = get_object_or_404(
        SaleInvoice.objects.select_related(
            'customer',
            'salesman',
            'booking_man_id',
            'supplying_man_id',
            'delivery_man_id',
            'city_id',
            'area_id',
        ),
        pk=pk,
    )
    return render(request, 'invoice/sale_detail.html', {'sale': invoice})
