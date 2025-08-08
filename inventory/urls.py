from django.urls import path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('parties', views.PartyViewSet)


urlpatterns = [
    path('price-lists/', views.price_list_list, name='price_list_list'),
    path('price-lists/<int:pk>/', views.price_list_detail, name='price_list_detail'),
]

urlpatterns += router.urls
