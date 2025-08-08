from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('pricing', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='pricelist',
            name='description',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='pricelistitem',
            name='description',
            field=models.TextField(blank=True),
        ),
    ]
