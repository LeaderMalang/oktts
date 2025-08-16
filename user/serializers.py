from django.contrib.auth import authenticate
from rest_framework import serializers

from inventory.models import Party
from .models import CustomUser


class UserSerializer(serializers.ModelSerializer):
    """Serializer for the User model exposing basic fields."""

    class Meta:
        model = CustomUser
        fields = ("id", "email", "role")


class AuthTokenSerializer(serializers.Serializer):
    """Serializer for obtaining auth tokens using login credentials."""

    username = serializers.CharField()
    password = serializers.CharField(trim_whitespace=False, write_only=True)

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")
        user_exist =CustomUser.objects.filter(email=username,is_active=True).exists()  # Ensure user exists
        if user_exist is False:
            
            raise serializers.ValidationError(
                "User with this email does not exist or not active.",
                code="authorization",
            )
        user = authenticate(
            request=self.context.get("request"),
            username=username,
            password=password,
        )
        if not user:
            raise serializers.ValidationError(
                "Unable to authenticate with provided credentials",
                code="authorization",
            )
        attrs["user"] = user
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, attrs):
        email = attrs.get("email")
        if not CustomUser.objects.filter(email=email, is_active=True).exists():
            raise serializers.ValidationError(
                "User with this email does not exist or not active."
            )
        return attrs


class PartySerializer(serializers.ModelSerializer):
    """Serializer for the `Party` model used during registration."""

    email = serializers.EmailField()

    class Meta:
        model = Party
        fields = (
            "id",
            "name",
            "address",
            "phone",
            "email",
            "party_type",
        )
        read_only_fields = ("id", "party_type")

