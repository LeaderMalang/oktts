from rest_framework import serializers

from .models import FinancialYear, PaymentSchedule, PaymentTerm


class PaymentTermSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentTerm
        fields = '__all__'


class FinancialYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialYear
        fields = '__all__'


class PaymentScheduleSerializer(serializers.ModelSerializer):
    journal_entry = serializers.SerializerMethodField(read_only=True)

    def get_journal_entry(self, obj):
        if obj.journal_entry:
            return {
                "id": obj.journal_entry.id,
                "timestamp": obj.journal_entry.timestamp,
                "description": obj.journal_entry.description,
            }
        return None

    class Meta:
        model = PaymentSchedule
        fields = '__all__'
        read_only_fields = ('journal_entry',)
