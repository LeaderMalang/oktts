from .settings import *

# Disable migrations for faster/simpler test database creation
MIGRATION_MODULES = {
    'sale': None,
    'purchase': None,
    'inventory': None,
    'setting': None,
    'hr': None,
    'expense': None,
    'report': None,
    'finance': None,
    'user': None,
    'crm': None,
    'task': None,
    'notification': None,
    'pricing': None,
    'investor': None,
    'syncqueue': None,
    'ecommerce': None,
}

# Limit installed apps to core modules needed for tests
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'drf_spectacular',
    'user',
    'hr',
    'setting',
    'inventory',
    'sale',
    'purchase',
    'finance',
    'django_ledger',
    'notification',
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

ROOT_URLCONF = 'sale.urls'
