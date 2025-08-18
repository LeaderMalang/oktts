from django.db import models

# Create your models here.


class City(models.Model):
    name = models.CharField(max_length=100)


class Area(models.Model):
    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=100)


class Company(models.Model):
    name = models.CharField(max_length=100)
    payroll_expense_account = models.ForeignKey(
        'voucher.ChartOfAccount',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payroll_expense_company'
    )
    payroll_payment_account = models.ForeignKey(
        'voucher.ChartOfAccount',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payroll_payment_company'
    )

class Group(models.Model):
    name = models.CharField(max_length=100)

class Distributor(models.Model):
    name = models.CharField(max_length=100)

class Branch(models.Model):
    name = models.CharField(max_length=100)
    address = models.TextField()
    sale_invoice_footer = models.TextField(blank=True)

class Warehouse(models.Model):
    name = models.CharField(max_length=100)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    default_sales_account = models.ForeignKey('voucher.ChartOfAccount', on_delete=models.SET_NULL, null=True, blank=True, related_name='sales_warehouse')
    default_purchase_account = models.ForeignKey('voucher.ChartOfAccount', on_delete=models.SET_NULL, null=True, blank=True, related_name='purchase_warehouse')
    default_cash_account = models.ForeignKey('voucher.ChartOfAccount', on_delete=models.SET_NULL, null=True, blank=True, related_name='cash_warehouse')
    default_bank_account = models.ForeignKey('voucher.ChartOfAccount', on_delete=models.SET_NULL, null=True, blank=True, related_name='bank_warehouse')
