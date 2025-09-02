from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('expense', '0002_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='expense',
            name='voucher',
        ),
    ]
