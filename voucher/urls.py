from rest_framework.routers import DefaultRouter

from .views import ChartOfAccountViewSet

router = DefaultRouter()
router.register('chart-of-accounts', ChartOfAccountViewSet)

urlpatterns = router.urls
