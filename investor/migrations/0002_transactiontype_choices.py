from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('investor', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='investortransaction',
            name='transaction_type',
            field=models.CharField(max_length=10, choices=[('investment', 'Investment'), ('payout', 'Payout'), ('profit', 'Profit')]),
        ),
    ]
