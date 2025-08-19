from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('finance', '0001_initial'),
        ('purchase', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='purchaseinvoice',
            name='payment_term',
            field=models.ForeignKey(blank=True, null=True, on_delete=models.deletion.SET_NULL, to='finance.paymentterm'),
        ),
    ]
