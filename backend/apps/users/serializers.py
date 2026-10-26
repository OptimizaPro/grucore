from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User


class EmailTokenObtainSerializer(serializers.Serializer):
    """Permite hacer login con email + password en lugar de username + password."""
    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email    = attrs['email'].lower().strip()
        password = attrs['password']

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                {'detail': 'No active account found with the given credentials'}
            )

        if not user.check_password(password):
            raise serializers.ValidationError(
                {'detail': 'No active account found with the given credentials'}
            )

        if not user.is_active:
            raise serializers.ValidationError(
                {'detail': 'No active account found with the given credentials'}
            )

        refresh = RefreshToken.for_user(user)
        return {
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
        }


class UserSerializer(serializers.ModelSerializer):
    full_name  = serializers.ReadOnlyField()
    avatar_url = serializers.SerializerMethodField()

    def get_avatar_url(self, obj):
        """ImageField (subida) tiene prioridad sobre URL externa."""
        if obj.avatar:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.avatar.url) if request else obj.avatar.url
        return obj.avatar_url

    class Meta:
        model = User
        fields = (
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'phone', 'avatar_url',
            'preferred_language', 'preferred_currency',
            'is_active', 'created_at',
        )
        read_only_fields = ('id', 'created_at')


class UserMeSerializer(UserSerializer):
    """Serializer para el endpoint /users/me/ — incluye campos sensibles propios."""

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'role', 'phone', 'password')

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.username = validated_data['email']
        user.set_password(password)
        user.save()
        return user
