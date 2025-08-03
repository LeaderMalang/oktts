from rest_framework import serializers
from .models import InvestorTransaction


class InvestorTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestorTransaction
        fields = '__all__'
