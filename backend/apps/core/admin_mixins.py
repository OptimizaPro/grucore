from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html


class CRUDActionsMixin:
    """
    Añade columna de acciones (ver, editar, eliminar) al final de list_display.
    Compatible con cualquier ModelAdmin. La eliminación usa la vista de
    confirmación nativa de Django admin.
    """
    def get_actions(self, request):
        return {}  # Elimina el dropdown "Acción:" — los iconos ya cubren CRUD

    def get_list_display(self, request):
        fields = list(super().get_list_display(request))
        if 'crud_actions' not in fields:
            fields.append('crud_actions')
        return fields

    @admin.display(description='')
    def crud_actions(self, obj):
        app   = obj._meta.app_label
        model = obj._meta.model_name
        pk    = obj.pk

        change_url = reverse(f'admin:{app}_{model}_change', args=[pk])
        delete_url = reverse(f'admin:{app}_{model}_delete', args=[pk])

        btn = (
            'display:inline-flex;align-items:center;justify-content:center;'
            'width:30px;height:30px;border-radius:6px;'
            'color:rgb(148 163 184);background:rgb(30 41 59);'
            'transition:color .15s,background .15s;text-decoration:none;'
        )

        return format_html(
            '<div style="display:flex;gap:4px;align-items:center;white-space:nowrap;">'

            # Ver
            '<a href="{change}" title="Ver" style="{btn}"'
            ' onmouseover="this.style.color=\'rgb(241 245 249)\';this.style.background=\'rgb(51 65 85)\'"'
            ' onmouseout="this.style.color=\'rgb(148 163 184)\';this.style.background=\'rgb(30 41 59)\'">'
            '<span class="material-symbols-outlined"'
            ' style="font-size:16px;font-variation-settings:\'FILL\' 0,\'wght\' 300;">visibility</span>'
            '</a>'

            # Editar
            '<a href="{change}" title="Editar" style="{btn}"'
            ' onmouseover="this.style.color=\'rgb(255 107 53)\';this.style.background=\'rgba(255,107,53,.12)\'"'
            ' onmouseout="this.style.color=\'rgb(148 163 184)\';this.style.background=\'rgb(30 41 59)\'">'
            '<span class="material-symbols-outlined"'
            ' style="font-size:16px;font-variation-settings:\'FILL\' 0,\'wght\' 300;">edit</span>'
            '</a>'

            # Eliminar
            '<a href="{delete}" title="Eliminar" style="{btn}"'
            ' onmouseover="this.style.color=\'rgb(239 68 68)\';this.style.background=\'rgba(239,68,68,.12)\'"'
            ' onmouseout="this.style.color=\'rgb(148 163 184)\';this.style.background=\'rgb(30 41 59)\'">'
            '<span class="material-symbols-outlined"'
            ' style="font-size:16px;font-variation-settings:\'FILL\' 0,\'wght\' 300;">delete</span>'
            '</a>'

            '</div>',
            change=change_url,
            delete=delete_url,
            btn=btn,
        )
