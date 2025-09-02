from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    dependencies = [
        ('hr', '0002_initial'),
        ('django_ledger', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='payrollslip',
            name='journal_entry',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='django_ledger.journalentrymodel'),
        ),
    ]
