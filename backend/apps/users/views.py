from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User
from .serializers import UserSerializer, UserMeSerializer, UserCreateSerializer, EmailTokenObtainSerializer


class EmailTokenObtainView(APIView):
    """POST /api/auth/token/  — login con email + password."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = EmailTokenObtainSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.filter(is_active=True)
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserCreateSerializer
        return UserSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            # Solo admins pueden crear usuarios
            return [permissions.IsAdminUser()]
        return super().get_permissions()


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


@api_view(['GET', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def me(request):
    """Perfil del usuario autenticado."""
    if request.method == 'GET':
        serializer = UserMeSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    serializer = UserMeSerializer(request.user, data=request.data, partial=True, context={'request': request})
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_avatar(request):
    """POST /api/users/me/avatar/ — sube foto de perfil (multipart)."""
    if 'avatar' not in request.FILES:
        return Response({'detail': 'No se proporcionó ningún archivo.'}, status=status.HTTP_400_BAD_REQUEST)

    file = request.FILES['avatar']
    if not file.content_type.startswith('image/'):
        return Response({'detail': 'El archivo debe ser una imagen.'}, status=status.HTTP_400_BAD_REQUEST)
    if file.size > 5 * 1024 * 1024:
        return Response({'detail': 'El archivo no puede superar 5 MB.'}, status=status.HTTP_400_BAD_REQUEST)

    request.user.avatar = file
    request.user.save(update_fields=['avatar'])
    serializer = UserMeSerializer(request.user, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    """POST /api/users/me/change-password/ — cambia contraseña."""
    current = request.data.get('current_password', '')
    new_pw  = request.data.get('new_password', '')

    if not request.user.check_password(current):
        return Response({'detail': 'Contraseña actual incorrecta.'}, status=status.HTTP_400_BAD_REQUEST)
    if len(new_pw) < 8:
        return Response({'detail': 'La nueva contraseña debe tener al menos 8 caracteres.'}, status=status.HTTP_400_BAD_REQUEST)

    request.user.set_password(new_pw)
    request.user.save(update_fields=['password'])
    return Response({'detail': 'Contraseña actualizada correctamente.'})
