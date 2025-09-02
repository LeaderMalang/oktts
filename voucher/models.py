from django.db import models

class Voucher(models.Model):
    created = models.DateTimeField(auto_now_add=True)

class VoucherType(models.Model):
    code = models.CharField(max_length=10)
    name = models.CharField(max_length=100)

class ChartOfAccount(models.Model):
    code = models.CharField(max_length=10)
    name = models.CharField(max_length=100)
