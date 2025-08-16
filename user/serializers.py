from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework import serializers

from inventory.models import Party
from .models import CustomUser, PasswordResetCode


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


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Validate a password reset code and supply a new password."""

    email = serializers.EmailField()
    code = serializers.CharField()
    new_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        code = attrs.get("code")

        try:
            reset_code = PasswordResetCode.objects.get(user__email=email, code=code)
        except PasswordResetCode.DoesNotExist:
            raise serializers.ValidationError("Invalid reset code.")

        if reset_code.expires_at < timezone.now():
            raise serializers.ValidationError("Reset code has expired.")

        attrs["user"] = reset_code.user
        attrs["reset_code"] = reset_code
        return attrs

