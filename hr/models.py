from django.db import models
from setting.models import Branch
# Create your models here.
class Employee(models.Model):
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True, null=True)
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True)
    active = models.BooleanField(default=True)

class EmployeeContract(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    position = models.CharField(max_length=100)
    notes = models.TextField(blank=True)

class LeaveRequest(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')], default='pending')

class SalesTarget(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    month = models.DateField()
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    achieved_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)