from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("finance", "0002_paymentschedule_voucher"),
    ]

    operations = [
        migrations.CreateModel(
            name="FinancialYear",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100)),
                ("start_date", models.DateField()),
                ("end_date", models.DateField()),
                ("is_active", models.BooleanField(default=False)),
            ],
        ),
    ]
