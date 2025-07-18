from django.db import models
from django.contrib.auth.models import User
# Create your models here.


class ReportLog(models.Model):
    report_name = models.CharField(max_length=100)
    generated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    filters_used = models.TextField()
    output_format = models.CharField(max_length=10, choices=[('pdf', 'PDF'), ('excel', 'Excel'), ('word', 'Word')])
    created_at = models.DateTimeField(auto_now_add=True)