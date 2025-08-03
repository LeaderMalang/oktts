from django.contrib import admin
from .models import PriceList, PriceListItem

admin.site.register(PriceList)
admin.site.register(PriceListItem)
