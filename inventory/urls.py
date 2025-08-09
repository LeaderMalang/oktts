from django.urls import path
from . import views

urlpatterns = [
    path('price-lists/', views.price_list_list, name='price_list_list'),
    path('price-lists/<int:pk>/', views.price_list_detail, name='price_list_detail'),

    path('movements/', views.stock_movement_list, name='stock_movement_list'),

    path('levels/', views.inventory_levels, name='inventory_levels'),

]
