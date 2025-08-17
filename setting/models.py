from django.db import models

# Create your models here.


class City(models.Model):
    name = models.CharField(max_length=100)
    def __str__(self):
        return self.name


class Area(models.Model):
    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name} ({self.city.name})" if self.city else self.name


class Company(models.Model):
    name = models.CharField(max_length=100)
    def __str__(self):
        return self.name

class Group(models.Model):
    name = models.CharField(max_length=100)
    def __str__(self):
        return self.name

class Distributor(models.Model):
    name = models.CharField(max_length=100)
    def __str__(self):
        return self.name

class Branch(models.Model):
    name = models.CharField(max_length=100)
    address = models.TextField()
    sale_invoice_footer = models.TextField(blank=True)
    def __str__(self):
        return self.name

class Warehouse(models.Model):
    name = models.CharField(max_length=100)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    default_sales_account = models.ForeignKey('voucher.ChartOfAccount', on_delete=models.SET_NULL, null=True, blank=True, related_name='sales_warehouse')
    default_purchase_account = models.ForeignKey('voucher.ChartOfAccount', on_delete=models.SET_NULL, null=True, blank=True, related_name='purchase_warehouse')
    def __str__(self):
        return self.name
