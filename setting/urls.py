from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CityViewSet,
    AreaViewSet,
    CompanyViewSet,
    GroupViewSet,
    DistributorViewSet,
    BranchViewSet,
    WarehouseViewSet,
)


router = DefaultRouter()
router.register(r'cities', CityViewSet)
router.register(r'areas', AreaViewSet)
router.register(r'companies', CompanyViewSet)
router.register(r'groups', GroupViewSet)
router.register(r'distributors', DistributorViewSet)
router.register(r'branches', BranchViewSet)
router.register(r'warehouses', WarehouseViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
