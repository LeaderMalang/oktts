from rest_framework import serializers

from .models import ChartOfAccount


class ChartOfAccountSerializer(serializers.ModelSerializer):
    accountType = serializers.CharField(source="account_type.name")
    parentId = serializers.IntegerField(source="parent_account_id", allow_null=True)
    isActive = serializers.BooleanField(source="is_active")

    class Meta:
        model = ChartOfAccount
        fields = ["id", "name", "code", "accountType", "parentId", "isActive"]
