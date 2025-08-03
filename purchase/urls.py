from django.urls import path
from . import views

urlpatterns = [
    path('investor-transactions/', views.investor_transaction_list, name='investortransaction_list'),
    path('investor-transactions/<int:pk>/', views.investor_transaction_detail, name='investortransaction_detail'),
]
