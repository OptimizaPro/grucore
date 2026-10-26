"""
Widget de carga de imagen con drag & drop para el admin de Django.
Diseñado para el tema oscuro de django-unfold.
"""
from django.forms.widgets import ClearableFileInput
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _


class DragDropImageWidget(ClearableFileInput):
    """
    Reemplaza el input de archivo estándar por una zona de drag & drop
    con preview de imagen, conservando el comportamiento nativo de
    ClearableFileInput (checkbox de borrado cuando ya hay imagen).
    """

    def render(self, name, value, attrs=None, renderer=None):
        attrs = self.build_attrs(self.attrs, attrs or {})
        input_id   = attrs.get('id', f'id_{name}')
        wrap_id    = f'dz-wrap-{input_id}'
        preview_id = f'dz-preview-{input_id}'
        hint_id    = f'dz-hint-{input_id}'
        clear_id   = f'dz-clear-{input_id}'

        # URL de la imagen actual
        current_url = ''
        if value and hasattr(value, 'url'):
            try:
                current_url = value.url
            except Exception:
                pass

        # Nombre del checkbox de borrado (igual que ClearableFileInput)
        clear_checkbox_name = self.clear_checkbox_name(name)

        # ── HTML ──────────────────────────────────────────────────────────────
        html = format_html(
            """
<div id="{wrap_id}" style="
    position:relative;
    width:100%;max-width:380px;
    border:2px dashed rgb(51 65 85);
    border-radius:0.75rem;
    padding:1.25rem;
    background:rgb(15 23 42);
    cursor:pointer;
    transition:border-color 0.2s, background 0.2s;
    text-align:center;
    user-select:none;
">
  <!-- Preview -->
  <div id="{preview_id}" style="display:{preview_display};margin-bottom:0.75rem;position:relative;">
    <img id="{preview_id}-img"
         src="{current_url}"
         alt="Avatar"
         style="width:100px;height:100px;border-radius:50%;object-fit:cover;
                border:2px solid rgb(51 65 85);margin:0 auto;display:block;" />
    <button type="button" id="{preview_id}-remove"
            title="Quitar selección"
            style="position:absolute;top:0;right:calc(50% - 62px);
                   background:rgb(239 68 68);border:none;color:#fff;
                   border-radius:50%;width:20px;height:20px;font-size:12px;
                   line-height:20px;cursor:pointer;padding:0;">✕</button>
  </div>

  <!-- Hint -->
  <div id="{hint_id}" style="display:{hint_display};pointer-events:none;">
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"
         viewBox="0 0 24 24" fill="none" stroke="rgb(100 116 139)"
         stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
         style="margin:0 auto 0.5rem;">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
    <p style="margin:0 0 0.25rem;font-size:0.8125rem;
              color:rgb(148 163 184);font-weight:500;">
      Arrastra tu foto aquí
    </p>
    <p style="margin:0;font-size:0.75rem;color:rgb(100 116 139);">
      o haz clic para buscar
    </p>
    <p style="margin:0.5rem 0 0;font-size:0.6875rem;color:rgb(71 85 105);">
      JPG, PNG, WEBP · Máx. 5 MB
    </p>
  </div>

  <!-- Input real (oculto) -->
  <input type="file" name="{name}" id="{input_id}"
         accept="image/*" style="display:none;" />
</div>

<!-- Checkbox de borrado (solo si ya hay imagen guardada) -->
{clear_html}

<script>
(function() {{
  var wrap    = document.getElementById('{wrap_id}');
  var input   = document.getElementById('{input_id}');
  var preview = document.getElementById('{preview_id}');
  var preImg  = document.getElementById('{preview_id}-img');
  var preRm   = document.getElementById('{preview_id}-remove');
  var hint    = document.getElementById('{hint_id}');
  var clearCb = document.getElementById('{clear_id}');

  function showPreview(src) {{
    preImg.src = src;
    preview.style.display = 'block';
    hint.style.display    = 'none';
  }}
  function showHint() {{
    preview.style.display = 'none';
    hint.style.display    = 'block';
    preImg.src = '';
  }}

  // Click en la zona abre el selector
  wrap.addEventListener('click', function(e) {{
    if (e.target === preRm) return;
    input.click();
  }});

  // Botón quitar selección local
  if (preRm) {{
    preRm.addEventListener('click', function(e) {{
      e.stopPropagation();
      input.value = '';
      showHint();
    }});
  }}

  // Drag & drop
  wrap.addEventListener('dragover', function(e) {{
    e.preventDefault();
    wrap.style.borderColor  = '#FF6B35';
    wrap.style.background   = 'rgba(255,107,53,0.05)';
  }});
  wrap.addEventListener('dragleave', function() {{
    wrap.style.borderColor  = 'rgb(51 65 85)';
    wrap.style.background   = 'rgb(15 23 42)';
  }});
  wrap.addEventListener('drop', function(e) {{
    e.preventDefault();
    wrap.style.borderColor  = 'rgb(51 65 85)';
    wrap.style.background   = 'rgb(15 23 42)';
    var files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {{
      // Asignar al input real para que el form lo envíe
      var dt = new DataTransfer();
      dt.items.add(files[0]);
      input.files = dt.files;
      showPreview(URL.createObjectURL(files[0]));
      if (clearCb) clearCb.checked = false;
    }}
  }});

  // Selección via file picker
  input.addEventListener('change', function() {{
    if (input.files && input.files[0]) {{
      showPreview(URL.createObjectURL(input.files[0]));
      if (clearCb) clearCb.checked = false;
    }}
  }});

  // Hover visual
  wrap.addEventListener('mouseenter', function() {{
    if (wrap.style.borderColor !== '#FF6B35')
      wrap.style.borderColor = 'rgb(100 116 139)';
  }});
  wrap.addEventListener('mouseleave', function() {{
    if (wrap.style.borderColor !== '#FF6B35')
      wrap.style.borderColor = 'rgb(51 65 85)';
  }});
}})();
</script>
""",
            wrap_id=wrap_id,
            preview_id=preview_id,
            hint_id=hint_id,
            clear_id=clear_id,
            name=name,
            input_id=input_id,
            current_url=current_url,
            preview_display='block' if current_url else 'none',
            hint_display='none' if current_url else 'block',
            clear_html=self._clear_html(clear_checkbox_name, clear_id) if current_url else '',
        )
        return html

    def _clear_html(self, clear_name, clear_id):
        return format_html(
            """
<label style="display:inline-flex;align-items:center;gap:0.5rem;
              margin-top:0.5rem;font-size:0.8125rem;color:rgb(100 116 139);
              cursor:pointer;">
  <input type="checkbox" name="{}" id="{}"
         style="accent-color:#ef4444;width:14px;height:14px;" />
  Eliminar foto actual
</label>
""",
            clear_name,
            clear_id,
        )
