from django.db import models, transaction

from inventory.models import Party, Product, Batch
from sale.models import SaleInvoice, SaleInvoiceItem
from hr.models import Employee

class Order(models.Model):
    STATUS_CHOICES = (
        ("Pending", "Pending"),
        ("Confirmed", "Confirmed"),
        ("Cancelled", "Cancelled"),
        ("Completed", "Completed"),
    )

    order_no = models.CharField(max_length=50, unique=True)
    date = models.DateField()
    customer = models.ForeignKey(Party, on_delete=models.CASCADE, limit_choices_to={'party_type': 'customer'})
    salesman=models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='salesman_orders', limit_choices_to={'role': 'SALES'})
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    sale_invoice = models.OneToOneField("sale.SaleInvoice", null=True, blank=True, on_delete=models.SET_NULL)
    address = models.TextField(blank=True, null=True)
    def __str__(self):
        return self.order_no

    def confirm(self, warehouse, payment_method,payment_terms=None):
        with transaction.atomic():
            invoice = SaleInvoice.objects.create(
                invoice_no=self.order_no,
                date=self.date,
                customer=self.customer,
                warehouse=warehouse,
                total_amount=self.total_amount,
                payment_method=payment_method,
                paid_amount=self.paid_amount,
                payment_term=payment_terms,
            )

            for item in self.items.all():
                batch = (
                    Batch.objects.filter(
                        product=item.product,
                        warehouse=warehouse,
                        quantity__gt=0,
                    )
                    .order_by("-expiry_date")
                    .first()
                )

                SaleInvoiceItem.objects.create(
                    invoice=invoice,
                    product=item.product,
                    batch=batch,
                    quantity=item.quantity,
                    rate=item.price,
                    amount=item.amount,
                    net_amount=item.amount,
                )

            self.status = "Confirmed"
            self.sale_invoice = invoice
            self.save(update_fields=["status", "sale_invoice"])

        return invoice


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    bid_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
