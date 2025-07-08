from django.db import models

# Create your models here.


class City(models.Model):
    name = models.CharField(max_length=100)

class Company(models.Model):
    name = models.CharField(max_length=100)

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