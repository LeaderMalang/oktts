# inventory/admin.py
from django.contrib import admin
from .models import Product, Party, Batch, StockMovement

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'company', 'rate', 'retail_price', 'stock', 'disable_sale_purchase')
    search_fields = ('name', 'barcode')
    list_filter = ('company', 'group', 'distributor')

@admin.register(Party)
class PartyAdmin(admin.ModelAdmin):
    list_display = ('name', 'party_type', 'phone', 'email', 'category', 'latitude', 'longitude', 'price_list')
    search_fields = ('name', 'phone', 'email', 'category')
    list_filter = ('party_type',)

@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ('product', 'batch_number', 'expiry_date', 'stock', 'rate')
    list_filter = ('product', 'expiry_date')
    search_fields = ('batch_number', 'product__name')

@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ('batch', 'movement_type', 'quantity', 'timestamp', 'reason')
    list_filter = ('movement_type', 'timestamp')
    search_fields = ('batch__batch_number', 'reason')
