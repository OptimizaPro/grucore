from rest_framework import serializers
from .models import PortfolioProject, PortfolioImage


class PortfolioImageSerializer(serializers.ModelSerializer):
    url        = serializers.SerializerMethodField()
    alt_es     = serializers.SerializerMethodField()
    alt_en     = serializers.SerializerMethodField()

    class Meta:
        model  = PortfolioImage
        fields = ('id', 'url', 'alt_es', 'alt_en', 'caption_es', 'caption_en', 'sort_order')

    def get_url(self, obj):
        return obj.asset.url if obj.asset_id else ''

    def get_alt_es(self, obj):
        return obj.asset.alt_es if obj.asset_id else ''

    def get_alt_en(self, obj):
        return obj.asset.alt_en if obj.asset_id else ''


class PortfolioProjectListSerializer(serializers.ModelSerializer):
    """Serializer ligero para listados (no incluye galería completa)."""
    cover_url    = serializers.SerializerMethodField()
    project_type_label = serializers.CharField(source='get_project_type_display', read_only=True)

    class Meta:
        model  = PortfolioProject
        fields = (
            'id', 'slug', 'title_es', 'title_en',
            'project_type', 'project_type_label',
            'location', 'year', 'area_m2',
            'tagline_es', 'tagline_en',
            'cover_url', 'featured', 'sort_order',
        )

    def get_cover_url(self, obj):
        return obj.cover_url


class PortfolioProjectDetailSerializer(PortfolioProjectListSerializer):
    """Serializer completo para la página de detalle."""
    gallery = PortfolioImageSerializer(source='gallery_images', many=True, read_only=True)

    class Meta(PortfolioProjectListSerializer.Meta):
        fields = PortfolioProjectListSerializer.Meta.fields + (
            'description_es', 'description_en', 'gallery',
        )
