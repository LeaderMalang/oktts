from django.urls import path
from . import views

urlpatterns = [
    path('', views.sale_invoice_list, name='sale_list'),
    path('create/', views.sale_invoice_create, name='sale_create'),
    path('<int:pk>/edit/', views.sale_invoice_edit, name='sale_edit'),
    path('<int:pk>/', views.sale_invoice_detail, name='sale_detail'),
]
