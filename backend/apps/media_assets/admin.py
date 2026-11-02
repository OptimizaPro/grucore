from django.contrib import admin
from django.db.models import Q
from django.utils.html import format_html
from unfold.admin import ModelAdmin

from apps.core.admin_mixins import CRUDActionsMixin
from .models import MediaAsset


# ── Filtro: dónde se usa el asset ─────────────────────────────────────────────

class UsageFilter(admin.SimpleListFilter):
    title         = 'Uso'
    parameter_name = 'usage'

    def lookups(self, request, model_admin):
        return [
            ('service',   'Servicios'),
            ('portfolio', 'Portfolio'),
            ('cms_block', 'Bloques CMS'),
            ('unused',    'Sin asignar'),
        ]

    def queryset(self, request, queryset):
        v = self.value()
        if v == 'service':
            return queryset.filter(
                Q(service_covers__isnull=False) |
                Q(service_befores__isnull=False) |
                Q(service_afters__isnull=False)
            ).distinct()
        if v == 'portfolio':
            return queryset.filter(
                Q(portfolio_covers__isnull=False) |
                Q(portfolio_gallery__isnull=False)
            ).distinct()
        if v == 'cms_block':
            return queryset.filter(cms_blocks__isnull=False).distinct()
        if v == 'unused':
            return queryset.filter(
                service_covers__isnull=True,
                service_befores__isnull=True,
                service_afters__isnull=True,
                portfolio_covers__isnull=True,
                portfolio_gallery__isnull=True,
                cms_blocks__isnull=True,
            ).distinct()
        return queryset


@admin.register(MediaAsset)
class MediaAssetAdmin(CRUDActionsMixin, ModelAdmin):
    list_display        = ('thumbnail_preview', 'name', 'context', 'alt_es', 'uploaded_by', 'uploaded_at')
    list_display_links  = ('thumbnail_preview', 'name')
    list_editable       = ('context',)
    search_fields       = ('name', 'alt_es', 'alt_en', 'context')
    list_filter         = (UsageFilter,)
    readonly_fields     = ('uploaded_at', 'uploaded_by', 'image_preview', 'public_url', 'usage_summary')
    ordering            = ('-uploaded_at',)

    fieldsets = [
        ('Archivo', {
            'fields': ('file', 'image_preview', 'public_url'),
        }),
        ('Metadatos', {
            'fields': ('name', 'context', 'alt_es', 'alt_en'),
        }),
        ('Uso actual', {
            'fields': ('usage_summary',),
        }),
        ('Auditoría', {
            'fields': ('uploaded_by', 'uploaded_at'),
            'classes': ['collapse'],
        }),
    ]

    # ── list thumbnail ──────────────────────────────────────────────────────
    @admin.display(description='Preview')
    def thumbnail_preview(self, obj: MediaAsset) -> str:
        if obj.file:
            return format_html(
                '<img src="{}" style="height:48px;width:72px;object-fit:cover;border-radius:4px;" />',
                obj.url,
            )
        return '—'

    # ── detail preview ──────────────────────────────────────────────────────
    @admin.display(description='Vista previa')
    def image_preview(self, obj: MediaAsset) -> str:
        if obj.file:
            return format_html(
                '<img src="{}" style="max-height:320px;max-width:640px;object-fit:contain;border-radius:6px;" />',
                obj.url,
            )
        return '—'

    # ── public URL copyable ─────────────────────────────────────────────────
    @admin.display(description='URL pública')
    def public_url(self, obj: MediaAsset) -> str:
        if obj.file:
            return format_html('<code style="font-size:0.8em;">{}</code>', obj.url)
        return '—'

    # ── uso real (reverse FK lookup) ────────────────────────────────────────
    @admin.display(description='Usado en')
    def usage_summary(self, obj: MediaAsset) -> str:
        if not obj.pk:
            return format_html('<span style="color:#64748b;font-size:11px;">Guarda el archivo primero</span>')

        refs = []

        # ServicePage
        for sp in obj.service_covers.all():
            refs.append(('service', f'{sp} — Portada'))
        for sp in obj.service_befores.all():
            refs.append(('service', f'{sp} — Antes'))
        for sp in obj.service_afters.all():
            refs.append(('service', f'{sp} — Después'))

        # PortfolioProject
        for pp in obj.portfolio_covers.all():
            refs.append(('portfolio', f'{pp} — Portada'))
        for pi in obj.portfolio_gallery.all():
            refs.append(('portfolio', f'{pi.project} — Galería'))

        # CMS Blocks
        for b in obj.cms_blocks.select_related('section__page').all():
            refs.append(('cms', f'{b.section.page.slug} › {b.section.key} › {b.key}'))

        if not refs:
            return format_html('<span style="color:#64748b;font-size:11px;">Sin asignar</span>')

        COLOR = {'service': '#FF6B35', 'portfolio': '#6B8CFF', 'cms': '#34D399'}
        badges = []
        for kind, label in refs:
            color = COLOR.get(kind, '#8A95A5')
            badges.append(format_html(
                '<span style="display:inline-block;margin:2px 4px 2px 0;padding:2px 8px;'
                'border-radius:4px;font-size:11px;font-weight:600;'
                'background:{0}22;color:{0};border:1px solid {0}44">{1}</span>',
                color, label,
            ))
        return format_html(''.join(b for b in badges))

    # ── custom add view: bypasses Unfold form (avoids ImageField 500 bug) ──────
    def add_view(self, request, form_url='', extra_context=None):
        if request.method == 'POST':
            import os
            from django.http import HttpResponseRedirect
            from django.contrib import messages
            file = request.FILES.get('file')
            if not file:
                messages.error(request, 'Selecciona un archivo.')
            elif not file.content_type.startswith('image/'):
                messages.error(request, 'Solo se permiten imágenes.')
            else:
                asset = MediaAsset(
                    name=request.POST.get('name', '') or os.path.splitext(file.name)[0],
                    context=request.POST.get('context', ''),
                    alt_es=request.POST.get('alt_es', ''),
                    alt_en=request.POST.get('alt_en', ''),
                    uploaded_by=request.user,
                )
                asset.file.save(file.name, file, save=True)
                messages.success(request, f'"{asset.name}" subido correctamente.')
                return HttpResponseRedirect('../')

        from django.http import HttpResponse
        html = """
        <!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
        <title>Subir imagen — Media Assets</title>
        <style>
          body{font-family:system-ui,sans-serif;background:#131D28;color:#F0EDE8;margin:0;padding:40px}
          .card{max-width:560px;margin:0 auto;background:#1F2D3A;border:1px solid #27384A;border-radius:12px;padding:32px}
          h1{font-size:1.25rem;margin:0 0 8px;color:#F0EDE8}
          p.sub{color:#8A95A5;font-size:.85rem;margin:0 0 28px}
          label{display:block;font-size:.75rem;color:#8A95A5;margin-bottom:6px;font-weight:500}
          input,textarea{width:100%;box-sizing:border-box;background:#131D28;border:1px solid #27384A;
            border-radius:8px;padding:10px 14px;color:#F0EDE8;font-size:.875rem;margin-bottom:16px}
          input:focus,textarea:focus{outline:none;border-color:#FF6B35}
          .drop{border:2px dashed #27384A;border-radius:8px;padding:32px;text-align:center;
            color:#8A95A5;font-size:.85rem;cursor:pointer;margin-bottom:16px;transition:.2s}
          .drop:hover,.drop.over{border-color:#FF6B35;color:#FF6B35}
          .actions{display:flex;gap:12px;align-items:center;margin-top:8px}
          .btn-primary{background:#FF6B35;color:#131D28;border:none;padding:10px 24px;
            border-radius:8px;font-weight:600;font-size:.875rem;cursor:pointer}
          .btn-secondary{color:#8A95A5;text-decoration:none;font-size:.875rem}
          .msg{padding:10px 16px;border-radius:8px;margin-bottom:20px;font-size:.875rem}
          .msg.error{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);color:#f87171}
          .msg.success{background:rgba(74,158,107,.1);border:1px solid rgba(74,158,107,.2);color:#4ade80}
        </style></head><body>
        <div class="card">
          <a href="../" style="color:#8A95A5;font-size:.8rem;text-decoration:none;">← Volver a Media Assets</a>
          <h1 style="margin-top:20px">Subir imagen</h1>
          <p class="sub">JPG, PNG o WebP · Máx. 15 MB</p>
          {messages_html}
          <form method="post" enctype="multipart/form-data" id="uploadForm">
            <input type="hidden" name="csrfmiddlewaretoken" value="{csrf}">
            <div class="drop" id="drop" onclick="document.getElementById('fileInput').click()">
              <div id="dropLabel">Arrastra tu imagen aquí o haz clic para seleccionar</div>
            </div>
            <input type="file" id="fileInput" name="file" accept="image/*" style="display:none"
              onchange="document.getElementById('dropLabel').textContent=this.files[0]?.name||'Selecciona una imagen'">
            <label>Nombre descriptivo (opcional)</label>
            <input type="text" name="name" placeholder="Ej. Cocina renovada — Cliente García">
            <label>Contexto de uso (opcional)</label>
            <input type="text" name="context" placeholder="Ej. Servicios / Portada">
            <label>Texto alt ES (opcional)</label>
            <input type="text" name="alt_es" placeholder="Descripción de la imagen en español">
            <label>Texto alt EN (opcional)</label>
            <input type="text" name="alt_en" placeholder="Image description in English">
            <div class="actions">
              <button type="submit" class="btn-primary">Subir imagen</button>
              <a href="../" class="btn-secondary">Cancelar</a>
            </div>
          </form>
        </div>
        <script>
          const drop=document.getElementById('drop');
          drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('over')});
          drop.addEventListener('dragleave',()=>drop.classList.remove('over'));
          drop.addEventListener('drop',e=>{
            e.preventDefault();drop.classList.remove('over');
            const f=e.dataTransfer.files[0];
            if(f){
              const dt=new DataTransfer();dt.items.add(f);
              document.getElementById('fileInput').files=dt.files;
              document.getElementById('dropLabel').textContent=f.name;
            }
          });
        </script></body></html>
        """
        from django.middleware.csrf import get_token
        msgs = ''
        for m in request._messages if hasattr(request, '_messages') else []:
            cls = 'error' if m.level >= 40 else 'success'
            msgs += f'<div class="msg {cls}">{m.message}</div>'
        return HttpResponse(html.replace('{csrf}', get_token(request)).replace('{messages_html}', msgs))

    # ── auto-assign uploader on create ─────────────────────────────────────
    def save_model(self, request, obj, form, change):
        if not change:
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)
