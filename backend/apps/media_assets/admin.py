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
        import os
        from django.http import HttpResponse, HttpResponseRedirect
        error_msg = ''
        success_msg = ''

        if request.method == 'POST':
            file = request.FILES.get('file')
            if not file:
                error_msg = 'Selecciona un archivo de imagen.'
            elif not file.content_type.startswith('image/'):
                error_msg = 'Solo se permiten imágenes (JPG, PNG, WebP).'
            else:
                try:
                    import boto3
                    from datetime import date
                    from django.conf import settings
                    from django.contrib import messages

                    import re, traceback as tb
                    # Sanitizar nombre: solo alfanuméricos, guiones y puntos
                    safe_name = re.sub(r'[^a-zA-Z0-9._-]', '_', os.path.basename(file.name))
                    s3_key    = f"assets/{date.today().strftime('%Y/%m')}/{safe_name}"

                    # Upload directo con boto3 (bypasa django-storages)
                    opts   = settings.STORAGES['default']['OPTIONS']
                    client = boto3.client(
                        's3',
                        endpoint_url          = opts['endpoint_url'],
                        aws_access_key_id     = opts['access_key'],
                        aws_secret_access_key = opts['secret_key'],
                        region_name           = opts.get('region_name', 'us-east-1'),
                    )
                    file.seek(0)
                    content = file.read()
                    # Debug info en caso de error
                    _debug = f"key={s3_key} size={len(content)} ctype={file.content_type}"
                    client.put_object(
                        Bucket = opts['bucket_name'],
                        Key    = s3_key,
                        Body   = content,
                    )

                    # Crear MediaAsset apuntando al path S3
                    display_name = request.POST.get('name', '').strip() or os.path.splitext(basename)[0]
                    asset = MediaAsset(
                        name        = display_name,
                        context     = request.POST.get('context', ''),
                        alt_es      = request.POST.get('alt_es', ''),
                        alt_en      = request.POST.get('alt_en', ''),
                        uploaded_by = request.user,
                    )
                    asset.file.name = s3_key
                    asset.save()

                    messages.success(request, f'"{asset.name}" subido correctamente.')
                    return HttpResponseRedirect('../')
                except Exception as exc:
                    error_msg = f'Error al subir [{_debug if "_debug" in dir() else "?"}]: {exc}'

        from django.middleware.csrf import get_token
        html = """
        <!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
        <title>Subir imagen — Media Assets</title>
        <style>
          *{box-sizing:border-box}
          body{font-family:system-ui,sans-serif;background:#131D28;color:#F0EDE8;margin:0;padding:40px}
          .card{max-width:580px;margin:0 auto;background:#1F2D3A;border:1px solid #27384A;border-radius:12px;padding:36px}
          h1{font-size:1.25rem;margin:0 0 6px;color:#F0EDE8;font-weight:600}
          p.sub{color:#8A95A5;font-size:.82rem;margin:0 0 28px}
          label{display:block;font-size:.72rem;color:#8A95A5;margin-bottom:5px;font-weight:500;text-transform:uppercase;letter-spacing:.05em}
          input{width:100%;background:#131D28;border:1px solid #27384A;border-radius:8px;
            padding:10px 14px;color:#F0EDE8;font-size:.875rem;margin-bottom:16px;transition:border-color .15s}
          input:focus{outline:none;border-color:#FF6B35}
          .drop{border:2px dashed #27384A;border-radius:10px;padding:36px 24px;text-align:center;
            color:#8A95A5;font-size:.85rem;cursor:pointer;margin-bottom:20px;transition:all .2s;background:#131D28}
          .drop:hover,.drop.over{border-color:#FF6B35;color:#FF6B35;background:rgba(255,107,53,.04)}
          .drop-icon{font-size:2rem;margin-bottom:8px;display:block}
          .drop-hint{font-size:.75rem;color:#4A5568;margin-top:4px}
          .actions{display:flex;gap:12px;align-items:center;margin-top:20px}
          .btn-primary{background:#FF6B35;color:#131D28;border:none;padding:11px 28px;
            border-radius:8px;font-weight:700;font-size:.875rem;cursor:pointer;
            display:inline-flex;align-items:center;gap:8px;transition:background .15s;min-width:140px;justify-content:center}
          .btn-primary:hover:not(:disabled){background:#ff8255}
          .btn-primary:disabled{opacity:.6;cursor:not-allowed}
          .btn-secondary{color:#8A95A5;text-decoration:none;font-size:.875rem;padding:11px 0;transition:color .15s}
          .btn-secondary:hover{color:#F0EDE8}
          .msg{padding:12px 16px;border-radius:8px;margin-bottom:20px;font-size:.85rem;line-height:1.5}
          .msg.error{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);color:#fca5a5}
          .msg.success{background:rgba(74,158,107,.08);border:1px solid rgba(74,158,107,.2);color:#86efac}
          .spinner{width:14px;height:14px;border:2px solid rgba(0,0,0,.2);border-top-color:#131D28;
            border-radius:50%;animation:spin .6s linear infinite;display:none}
          @keyframes spin{to{transform:rotate(360deg)}}
        </style></head><body>
        <div class="card">
          <a href="../" style="color:#8A95A5;font-size:.8rem;text-decoration:none;display:inline-flex;align-items:center;gap:4px;margin-bottom:20px;">← Volver a Media Assets</a>
          <h1>Subir imagen</h1>
          <p class="sub">JPG, PNG o WebP · Máx. 15 MB · Se almacena en Supabase</p>
          {messages_html}
          <form method="post" enctype="multipart/form-data" id="uploadForm" onsubmit="handleSubmit(event)">
            <input type="hidden" name="csrfmiddlewaretoken" value="{csrf}">
            <div class="drop" id="drop" onclick="document.getElementById('fileInput').click()">
              <span class="drop-icon">🖼️</span>
              <div id="dropLabel">Arrastra tu imagen aquí o haz clic para seleccionar</div>
              <div class="drop-hint">JPG · PNG · WebP</div>
            </div>
            <input type="file" id="fileInput" name="file" accept="image/*" style="display:none"
              onchange="onFileSelect(this)">
            <label>Nombre descriptivo (opcional)</label>
            <input type="text" name="name" placeholder="Ej. Cocina renovada — Cliente García">
            <label>Contexto de uso (opcional)</label>
            <input type="text" name="context" placeholder="Ej. Servicios / Portada">
            <label>Texto alt ES (opcional)</label>
            <input type="text" name="alt_es" placeholder="Descripción de la imagen en español">
            <label>Texto alt EN (opcional)</label>
            <input type="text" name="alt_en" placeholder="Image description in English">
            <div class="actions">
              <button type="submit" class="btn-primary" id="submitBtn">
                <div class="spinner" id="spinner"></div>
                <span id="btnText">Subir imagen</span>
              </button>
              <a href="../" class="btn-secondary">Cancelar</a>
            </div>
          </form>
        </div>
        <script>
          function onFileSelect(input){
            const f=input.files[0];
            if(f){document.getElementById('dropLabel').textContent=f.name;
              document.getElementById('drop').style.borderColor='#FF6B35';}
          }
          function handleSubmit(e){
            const btn=document.getElementById('submitBtn');
            const spinner=document.getElementById('spinner');
            const txt=document.getElementById('btnText');
            btn.disabled=true;
            spinner.style.display='block';
            txt.textContent='Subiendo…';
          }
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
        msgs = ''
        if error_msg:
            msgs = f'<div class="msg error">{error_msg}</div>'
        elif success_msg:
            msgs = f'<div class="msg success">{success_msg}</div>'
        return HttpResponse(html.replace('{csrf}', get_token(request)).replace('{messages_html}', msgs))

    # ── auto-assign uploader on create ─────────────────────────────────────
    def save_model(self, request, obj, form, change):
        if not change:
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)
