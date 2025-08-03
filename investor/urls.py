from rest_framework.routers import DefaultRouter
from .views import InvestorTransactionViewSet

router = DefaultRouter()
router.register(r'transactions', InvestorTransactionViewSet)

urlpatterns = router.urls
