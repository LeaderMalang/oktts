from rest_framework import permissions, viewsets, status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import CustomUser
from .serializers import AuthTokenSerializer, UserSerializer, PartySerializer
from inventory.models import Party

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

