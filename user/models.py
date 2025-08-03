# accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLES = (
        ('SUPER_ADMIN','Super Admin'),
        ('CUSTOMER','Customer'),
        ('MANAGER','Manager'),
        ('SALES','Sales'),
        ('DELIVERY','Delivery'),
        ('WAREHOUSE_ADMIN','Warehouse Admin'),
        ('DELIVERY_MANAGER','Delivery Manager'),
        ('RECOVERY_OFFICER','Recovery Officer'),
        ('INVESTOR','Investor'),
    )
    role = models.CharField(max_length=30, choices=ROLES, default='CUSTOMER')

    def __str__(self):
        return f"{self.username} ({self.role})"
