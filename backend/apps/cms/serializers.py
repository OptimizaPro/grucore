import json
from rest_framework import serializers
from .models import Page, Section, Block


class PageSerializer(serializers.ModelSerializer):
    """Devuelve la página con secciones y bloques estructurados según el idioma solicitado."""

    sections = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()
    meta_description = serializers.SerializerMethodField()

    class Meta:
        model = Page
        fields = ('slug', 'title', 'meta_description', 'is_published', 'updated_at', 'sections')

    def _lang(self):
        return self.context.get('lang', 'es')

    def get_title(self, obj):
        return getattr(obj, f'title_{self._lang()}', obj.title_es)

    def get_meta_description(self, obj):
        return getattr(obj, f'meta_description_{self._lang()}', obj.meta_description_es)

    def get_sections(self, obj):
        lang = self._lang()
        result = {}
        for section in obj.sections.filter(is_visible=True).prefetch_related('blocks'):
            blocks = {}
            for block in section.blocks.select_related('image_asset').all():
                # image_asset blocks return the CDN/local URL directly
                if block.block_type == Block.TYPE_IMAGE_ASSET:
                    raw = block.image_asset.url if block.image_asset_id else ''
                else:
                    raw = getattr(block, f'value_{lang}', block.value_es) or block.value_es
                    if block.block_type == Block.TYPE_JSON:
                        try:
                            raw = json.loads(raw)
                        except (json.JSONDecodeError, TypeError):
                            pass
                    elif block.block_type == Block.TYPE_BOOLEAN:
                        raw = raw.strip().lower() in ('true', '1', 'yes', 'sí', 'si')
                    elif block.block_type == Block.TYPE_NUMBER:
                        try:
                            raw = float(raw) if '.' in str(raw) else int(raw)
                        except (ValueError, TypeError):
                            pass
                blocks[block.key] = raw
            result[section.key] = {
                'label': section.label,
                'blocks': blocks,
            }
        return result
