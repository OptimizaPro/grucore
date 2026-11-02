from rest_framework import serializers
from django.conf import settings

from .models import DesignSession, ModelKey


class DesignSessionSerializer(serializers.ModelSerializer):
    renders_urls = serializers.SerializerMethodField()
    input_images_urls = serializers.SerializerMethodField()

    class Meta:
        model  = DesignSession
        fields = [
            'id',
            'session_type',
            'style',
            'project_type',
            'floors',
            'extra_description',
            'model_key',
            'input_images',
            'input_images_urls',
            'renders',
            'renders_urls',
            'status',
            'error_message',
            'prompt_used',
            'lead',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'renders',
            'renders_urls',
            'input_images',
            'input_images_urls',
            'status',
            'error_message',
            'prompt_used',
            'created_at',
            'updated_at',
        ]

    def _build_url(self, request, path: str) -> str:
        if not path:
            return ''
        if path.startswith('http'):
            return path
        base = request.build_absolute_uri(settings.MEDIA_URL) if request else settings.MEDIA_URL
        return f"{base.rstrip('/')}/{path.lstrip('/')}"

    def get_renders_urls(self, obj):
        request = self.context.get('request')
        return [self._build_url(request, p) for p in (obj.renders or [])]

    def get_input_images_urls(self, obj):
        request = self.context.get('request')
        return [self._build_url(request, p) for p in (obj.input_images or [])]


class AvailableModelSerializer(serializers.Serializer):
    """Returns the list of available AI models for the frontend dropdown."""
    key         = serializers.CharField()
    label       = serializers.CharField()
    is_free     = serializers.BooleanField()
    description = serializers.CharField()
