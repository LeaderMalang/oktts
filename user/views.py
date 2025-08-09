from rest_framework import permissions, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import CustomUser
from .serializers import AuthTokenSerializer, UserSerializer


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
        return Response({"token": token.key, "user": UserSerializer(user).data})

    @action(detail=False, methods=["post"], url_path="refresh", permission_classes=[permissions.IsAuthenticated])
    def refresh(self, request):
        token, _ = Token.objects.get_or_create(user=request.user)
        return Response({"token": token.key})

