from django.core.management.base import BaseCommand
from voucher.models import AccountType, ChartOfAccount
from inventory.models import Party
from setting.models import Warehouse
from django.db import transaction

DEFAULT_COA = {
    'ASSET': [
        ('1001', 'Cash'),
        ('1002', 'Bank'),
        ('1003', 'Accounts Receivable'),
        ('1004', 'Inventory'),
    ],
    'LIABILITY': [
        ('2001', 'Accounts Payable'),
        ('2002', 'Loans Payable'),
    ],
    'INCOME': [
        ('4001', 'Sales Revenue'),
        ('4002', 'Service Income'),
    ],
    'EXPENSE': [
        ('5001', 'Purchase'),
        ('5002', 'Salaries'),
        ('5003', 'Rent'),
        ('5004', 'Utilities'),
    ],
    'EQUITY': [
        ('3001', 'Owner’s Capital'),
        ('3002', 'Retained Earnings'),
    ],
}

class Command(BaseCommand):
    help = "Initialize default Chart of Accounts and link to Parties & Warehouses"

    @transaction.atomic
    def handle(self, *args, **options):
        type_objs = {}
        for key, label in AccountType.ACCOUNT_TYPES:
            atype, _ = AccountType.objects.get_or_create(name=key)
            type_objs[key] = atype

        for acc_type, entries in DEFAULT_COA.items():
            for code, name in entries:
                ChartOfAccount.objects.get_or_create(
                    code=code,
                    name=name,
                    account_type=type_objs[acc_type]
                )

        for party in Party.objects.all():
            if not party.chart_of_account:
                coa, _ = ChartOfAccount.objects.get_or_create(
                    name=f"{party.name} A/C",
                    code=f"PTY{party.id:04}",
                    account_type=type_objs['ASSET' if party.party_type == 'customer' else 'LIABILITY']
                )
                party.chart_of_account = coa
                party.save()

        for wh in Warehouse.objects.all():
            if not wh.default_sales_account:
                wh.default_sales_account = ChartOfAccount.objects.get(code="4001")
            if not wh.default_purchase_account:
                wh.default_purchase_account = ChartOfAccount.objects.get(code="5001")
            wh.save()

        self.stdout.write(self.style.SUCCESS("✅ Accounting initialization complete."))
