from django.db import migrations


def create_installment_voucher_types(apps, schema_editor):
    VoucherType = apps.get_model('voucher', 'VoucherType')
    VoucherType.objects.get_or_create(
        code='PIN', defaults={'name': 'Purchase Installment'}
    )
    VoucherType.objects.get_or_create(
        code='SIN', defaults={'name': 'Sale Installment'}
    )


class Migration(migrations.Migration):

    dependencies = [
        ('voucher', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_installment_voucher_types, migrations.RunPython.noop),
    ]

