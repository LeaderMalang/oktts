from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ChartOfAccountViewSet, customer_ledger, ledger

router = DefaultRouter()
router.register(r'accounts', ChartOfAccountViewSet, basename='account')

urlpatterns = [
    path('ledger/customer/<int:party_id>/', customer_ledger, name='customer_ledger'),
    path('ledger/<int:account_id>/', ledger, name='ledger'),
    path('', include(router.urls)),
]
