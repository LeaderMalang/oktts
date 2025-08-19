from django.db import migrations


def create_journal_voucher_type(apps, schema_editor):
    """Ensure a voucher type exists for general journal entries."""
    VoucherType = apps.get_model("voucher", "VoucherType")
    VoucherType.objects.get_or_create(
        code="JV", defaults={"name": "Journal"}
    )


class Migration(migrations.Migration):

    dependencies = [
        ("voucher", "0002_add_installment_vouchertypes"),
    ]

    operations = [
        migrations.RunPython(
            create_journal_voucher_type, migrations.RunPython.noop
        ),
    ]

