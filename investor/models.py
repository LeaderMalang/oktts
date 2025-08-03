from django.db import models


class InvestorTransaction(models.Model):
    investor = models.ForeignKey('inventory.Party', on_delete=models.CASCADE, limit_choices_to={'party_type': 'investor'})
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=10, choices=[('IN', 'In'), ('OUT', 'Out')])
    date = models.DateField()
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.investor.name} - {self.amount}"
