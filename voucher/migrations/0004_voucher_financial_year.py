from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("finance", "0003_financialyear"),
        ("voucher", "0003_add_journal_vouchertype"),
    ]

    operations = [
        migrations.AddField(
            model_name="voucher",
            name="financial_year",
            field=models.ForeignKey(null=True, on_delete=models.PROTECT, related_name="vouchers", to="finance.financialyear"),
        ),
    ]
