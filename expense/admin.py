from django.contrib import admin
from .models import ExpenseCategory, Expense



@admin.register(ExpenseCategory)
class ExpenseCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "chart_of_account")


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("date", "category", "amount", "payment_account", "voucher")
    readonly_fields = ("voucher",)

