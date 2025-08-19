from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("voucher", "0003_add_journal_vouchertype"),
    ]

    operations = [
        migrations.CreateModel(
            name="FinancialYear",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("start_date", models.DateField()),
                ("end_date", models.DateField()),
                ("is_closed", models.BooleanField(default=False)),
            ],
        ),
    ]
