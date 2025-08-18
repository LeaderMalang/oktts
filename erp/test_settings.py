from .settings import *

# Disable migrations for faster/simpler test database creation
MIGRATION_MODULES = {
    'sale': None,
    'purchase': None,
    'inventory': None,
    'setting': None,
    'voucher': None,
    'hr': None,
    'expense': None,
    'report': None,
    'user': None,
    'crm': None,
    'task': None,
    'notification': None,
    'pricing': None,
    'investor': None,
    'syncqueue': None,
}
