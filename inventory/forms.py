from django import forms
from .models import Party


class PartyForm(forms.ModelForm):
    """Form for creating and updating Party instances."""

    class Meta:
        model = Party
        fields = [
            'name',
            'address',
            'phone',
            'email',
            'party_type',
            'category',
            'city',
            'area',
            'latitude',
            'longitude',
            'price_list',
            'proprietor',
            'license_no',
            'license_expiry',
            'credit_limit',
        ]
