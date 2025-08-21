from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ("sale", "0004_alter_salereturnitem_net_amount"),
        ("ecommerce", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="order",
            name="sale_invoice",
            field=models.OneToOneField(blank=True, null=True, on_delete=models.SET_NULL, to="sale.saleinvoice"),
        ),
    ]
