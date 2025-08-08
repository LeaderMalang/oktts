from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('pricing', '0001_initial'),
    ]

    operations = [
        migrations.DeleteModel(
            name='PriceListItem',
        ),
        migrations.DeleteModel(
            name='PriceList',
        ),
    ]
