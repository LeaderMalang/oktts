from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    dependencies = [
        ('setting', '0002_initial'),
        ('django_ledger', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='company',
            name='payroll_expense_account',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='payroll_expense_company', to='django_ledger.accountmodel'),
        ),
        migrations.AlterField(
            model_name='company',
            name='payroll_payment_account',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='payroll_payment_company', to='django_ledger.accountmodel'),
        ),
    ]
