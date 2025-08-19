from rest_framework.routers import DefaultRouter
from .views import PaymentScheduleViewSet

router = DefaultRouter()
router.register(r'schedules', PaymentScheduleViewSet)

urlpatterns = router.urls
