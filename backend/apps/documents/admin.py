from django.contrib import admin
from unfold.admin import ModelAdmin
from apps.core.admin_mixins import CRUDActionsMixin
from .models import Document, RFI, Submittal, PunchItem


@admin.register(Document)
class DocumentAdmin(CRUDActionsMixin, ModelAdmin):
    list_display   = ('title', 'document_type', 'version', 'project', 'uploaded_by', 'is_archived', 'created_at')
    list_filter    = ('document_type', 'is_archived', 'project')
    search_fields  = ('title', 'description', 'file_name')
    date_hierarchy = 'created_at'


@admin.register(RFI)
class RFIAdmin(CRUDActionsMixin, ModelAdmin):
    list_display   = ('rfi_label', 'project', 'status', 'priority', 'submitted_by', 'due_date', 'created_at')

    @admin.display(description='Solicitud de Info (RFI)', ordering='number')
    def rfi_label(self, obj):
        return str(obj)

    list_filter    = ('status', 'priority', 'project')
    search_fields  = ('subject', 'description')
    date_hierarchy = 'created_at'
    readonly_fields = ('number', 'submitted_by', 'answered_by', 'answered_at', 'created_at', 'updated_at')

    fieldsets = (
        (None, {
            "fields": (
                ("subject", "number"),
                ("project", "phase"),
                ("status", "priority"),
                ("submitted_by", "assigned_to", "due_date"),
                "description",
            ),
        }),
        ("Respuesta", {
            "fields": (
                "answer",
                ("answered_by", "answered_at"),
            ),
            "classes": ["collapse"],
        }),
    )


@admin.register(Submittal)
class SubmittalAdmin(CRUDActionsMixin, ModelAdmin):
    list_display   = ('submittal_label', 'project', 'status', 'submitted_by', 'reviewed_by', 'review_date', 'created_at')

    @admin.display(description='Entregable técnico (Submittal)', ordering='number')
    def submittal_label(self, obj):
        return str(obj)

    list_filter    = ('status', 'project')
    search_fields  = ('title', 'description')
    date_hierarchy = 'created_at'


@admin.register(PunchItem)
class PunchItemAdmin(CRUDActionsMixin, ModelAdmin):
    list_display   = ('punch_label', 'project', 'status', 'priority', 'assigned_to', 'due_date', 'resolved_at', 'created_at')

    @admin.display(description='Obs. pendiente (Punch Item)', ordering='number')
    def punch_label(self, obj):
        return str(obj)

    list_filter    = ('status', 'priority', 'project')
    search_fields  = ('description', 'location')
    date_hierarchy = 'created_at'
    readonly_fields = ('number', 'created_by', 'resolved_at', 'created_at', 'updated_at')

    fieldsets = (
        (None, {
            "fields": (
                ("number", "status", "priority"),
                ("project", "phase"),
                ("assigned_to", "due_date"),
                "description",
                "location",
                "resolution_notes",
            ),
        }),
    )
