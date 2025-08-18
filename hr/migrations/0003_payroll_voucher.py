from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('voucher', '0001_initial'),
        ('hr', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='payrollslip',
            name='voucher',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='voucher.voucher'),
        ),
    ]
