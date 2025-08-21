from django.db import models

from inventory.models import Party, Product


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

    def __str__(self):
        return self.order_no


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
