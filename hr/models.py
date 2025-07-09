from django.db import models
from django.contrib.auth.models import User

class Employee(models.Model):
    ROLE_CHOICES = [
        ('SALES', 'Salesperson'),
        ('DELIVERY', 'Delivery Man'),
        ('ADMIN', 'Admin Staff'),
        ('MANAGER', 'Manager'),
    ]

    name = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True, null=True)
    cnic = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.name


class EmployeeContract(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.employee.name} - Contract"


class LeaveRequest(models.Model):
    LEAVE_TYPE_CHOICES = [
        ('ANNUAL', 'Annual'),
        ('SICK', 'Sick'),
        ('CASUAL', 'Casual'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPE_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    applied_on = models.DateTimeField(auto_now_add=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='leave_reviews')

    def __str__(self):
        return f"{self.employee.name} - {self.leave_type}"


class SalesTarget(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    month = models.DateField(help_text="1st of the target month")
    target_amount = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        unique_together = ('employee', 'month')

    def __str__(self):
        return f"{self.employee.name} - {self.month.strftime('%B %Y')}"


class DeliveryAssignment(models.Model):
    employee = models.ForeignKey(Employee, limit_choices_to={'role': 'DELIVERY'}, on_delete=models.CASCADE)
    sale = models.ForeignKey('sale.SaleInvoice', on_delete=models.CASCADE)
    assigned_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[
        ('ASSIGNED', 'Assigned'),
        ('DELIVERED', 'Delivered'),
        ('FAILED', 'Failed'),
    ], default='ASSIGNED')
    remarks = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.employee.name} - {self.sale.invoice_no}"


class Attendance(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    date = models.DateField()
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    is_absent = models.BooleanField(default=False)
    remarks = models.TextField(blank=True)

    class Meta:
        unique_together = ('employee', 'date')




class LeaveBalance(models.Model):
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE)
    annual = models.DecimalField(max_digits=5, decimal_places=1, default=12.0)
    sick = models.DecimalField(max_digits=5, decimal_places=1, default=8.0)
    casual = models.DecimalField(max_digits=5, decimal_places=1, default=4.0)

    def deduct_leave(self, leave_type, days):
        if leave_type == 'ANNUAL':
            self.annual = max(0, self.annual - days)
        elif leave_type == 'SICK':
            self.sick = max(0, self.sick - days)
        elif leave_type == 'CASUAL':
            self.casual = max(0, self.casual - days)
        self.save()




class PayrollSlip(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    month = models.DateField(help_text="1st of the payroll month")
    base_salary = models.DecimalField(max_digits=10, decimal_places=2)
    present_days = models.PositiveIntegerField()
    absent_days = models.PositiveIntegerField()
    leaves_paid = models.PositiveIntegerField(default=0)
    deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_salary = models.DecimalField(max_digits=10, decimal_places=2)

    created_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee.name} - {self.month.strftime('%B %Y')}"
