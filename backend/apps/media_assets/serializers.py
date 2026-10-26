from rest_framework import serializers
from .models import MediaAsset


class MediaAssetSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model  = MediaAsset
        fields = ('id', 'name', 'alt_es', 'alt_en', 'url', 'uploaded_at')
        read_only_fields = fields

    def get_url(self, obj: MediaAsset) -> str:
        return obj.url
