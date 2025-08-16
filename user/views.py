from rest_framework import permissions, viewsets, status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.response import Response


from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
import random


from .serializers import (
    AuthTokenSerializer,
    UserSerializer,
    PartySerializer,

    PasswordResetConfirmSerializer,

    PasswordResetRequestSerializer,

)
from inventory.models import Party
from user.models import CustomUser, PasswordResetCode
class UserViewSet(viewsets.ModelViewSet):
    """ViewSet providing CRUD operations for users and a `me` endpoint."""

    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class AuthViewSet(viewsets.ViewSet):
    """ViewSet handling authentication actions like login and token refresh."""

    serializer_class = AuthTokenSerializer

    @action(detail=False, methods=["post"], url_path="login")
    def login(self, request):
        serializer = self.serializer_class(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token, _ = Token.objects.get_or_create(user=user)
        party=Party.objects.filter(email=user.email).get()  # Activate party if exists
        return Response({"token": token.key, "user": UserSerializer(user).data,"party": PartySerializer(party).data if party else None})

    @action(detail=False, methods=["post"], url_path="refresh", permission_classes=[permissions.IsAuthenticated])
    def refresh(self, request):
        token, _ = Token.objects.get_or_create(user=request.user)
        return Response({"token": token.key})

    @action(detail=False, methods=["post"], url_path="register")
    def register(self, request):
        """Register a new customer with inactive user account."""

        party_serializer = PartySerializer(data=request.data)
        party_serializer.is_valid(raise_exception=True)

        password = request.data.get("password")
        if not password:
            return Response(
                {"detail": "Password is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        party = party_serializer.save(party_type="customer")

        CustomUser.objects.create_user(
            email=party.email,
            password=password,
            role="CUSTOMER",
            is_active=False,
        )

        return Response(
            {
                "message": "Registration successful. Await approval.",
                "party": PartySerializer(party).data,
            },
            status=status.HTTP_201_CREATED,
        )


    @action(detail=False, methods=["post"], url_path="reset-password/confirm")
    def reset_password_confirm(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        new_password = serializer.validated_data["new_password"]
        user.set_password(new_password)
        user.save()

        serializer.validated_data["reset_code"].delete()

        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(
        detail=False,
        methods=["post"],
        url_path="reset-password/request",
    )
    def reset_password_request(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        user = CustomUser.objects.get(email=email, is_active=True)
        code = f"{random.randint(0, 999999):06d}"
        expires_at = timezone.now() + timedelta(minutes=10)
        PasswordResetCode.objects.create(user=user, code=code, expires_at=expires_at)
        send_mail(
            "Password Reset Code",
            f"Your password reset code is {code}",
            None,
            [email],
        )
        return Response({"message": "If the email exists, a reset code has been sent."})


