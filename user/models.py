# accounts/models.py
from django.contrib.auth.models import AbstractUser,BaseUserManager
from django.db import models
from django.utils import timezone



class CustomUserManager(BaseUserManager):
        def create_user(self, email, password=None, **extra_fields):
            if not email:
                raise ValueError('The Email field must be set')
            email = self.normalize_email(email)
            user = self.model(email=email, **extra_fields)
            user.set_password(password)
            user.save(using=self._db)
            return user

        def create_superuser(self, email, password=None, **extra_fields):
            extra_fields.setdefault('is_staff', True)
            extra_fields.setdefault('is_superuser', True)
            extra_fields.setdefault('is_active', True)

            if extra_fields.get('is_staff') is not True:
                raise ValueError('Superuser must have is_staff=True.')
            if extra_fields.get('is_superuser') is not True:
                raise ValueError('Superuser must have is_superuser=True.')
            return self.create_user(email, password, **extra_fields)
class CustomUser(AbstractUser):
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
    username = None
    email = models.EmailField(unique=True)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["role"]
    objects = CustomUserManager()
    def __str__(self):
        return f"{self.email} ({self.role})"


class PasswordResetCode(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def is_expired(self):
        return timezone.now() >= self.expires_at

    def __str__(self):
        return f"{self.user.email} - {self.code}"
