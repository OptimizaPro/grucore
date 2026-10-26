from rest_framework import serializers
from .models import CompanySettings


class CompanySettingsSerializer(serializers.ModelSerializer):
    logo_url       = serializers.SerializerMethodField()
    logo_light_url = serializers.SerializerMethodField()

    class Meta:
        model  = CompanySettings
        fields = ['name', 'tagline', 'logo_url', 'logo_light_url', 'updated_at']
        read_only_fields = ['logo_url', 'logo_light_url', 'updated_at']

    def get_logo_url(self, obj):
        if not obj.logo or not obj.logo.name:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(obj.logo.url) if request else obj.logo.url

    def get_logo_light_url(self, obj):
        if not obj.logo_light or not obj.logo_light.name:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(obj.logo_light.url) if request else obj.logo_light.url
