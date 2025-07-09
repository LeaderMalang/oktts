from django.contrib import admin
from .models import City, Company, Group, Distributor,Branch,Warehouse

@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ['name']

@admin.register(Company)
class GroupAdmin(admin.ModelAdmin):
    list_display = ['name']

@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ['name']

@admin.register(Distributor)
class DistributorAdmin(admin.ModelAdmin):
    list_display = ['name']


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ['name','address','sale_invoice_footer']
@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ['name', 'branch']
