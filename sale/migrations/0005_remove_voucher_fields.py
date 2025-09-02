from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("sale", "0004_alter_salereturnitem_net_amount"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="saleinvoice",
            name="voucher",
        ),
        migrations.RemoveField(
            model_name="salereturn",
            name="voucher",
        ),
    ]
