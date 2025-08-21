from django.db import models, transaction

from inventory.models import Party, Product
from sale.models import SaleInvoice, SaleInvoiceItem


class Order(models.Model):
    STATUS_CHOICES = (
        ("Pending", "Pending"),
        ("Confirmed", "Confirmed"),
    )

    order_no = models.CharField(max_length=50, unique=True)
    date = models.DateField()
    customer = models.ForeignKey(Party, on_delete=models.CASCADE, limit_choices_to={'party_type': 'customer'})
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    sale_invoice = models.OneToOneField("sale.SaleInvoice", null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return self.order_no

    def confirm(self, warehouse, payment_method):
        with transaction.atomic():
            invoice = SaleInvoice.objects.create(
                invoice_no=self.order_no,
                date=self.date,
                customer=self.customer,
                warehouse=warehouse,
                total_amount=self.total_amount,
                payment_method=payment_method,
            )

            for item in self.items.all():
                SaleInvoiceItem.objects.create(
                    invoice=invoice,
                    product=item.product,
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
    amount = models.DecimalField(max_digits=12, decimal_places=2)
