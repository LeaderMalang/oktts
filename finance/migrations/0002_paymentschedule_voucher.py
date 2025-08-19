from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('voucher', '0002_add_installment_vouchertypes'),
        ('finance', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='paymentschedule',
            name='voucher',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='voucher.voucher'),
        ),
    ]

