from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline
from apps.core.admin_mixins import CRUDActionsMixin
from .models import Event


class AttendeeInline(TabularInline):
    model   = Event.attendees.through
    extra   = 0
    verbose_name        = 'Asistente'
    verbose_name_plural = 'Asistentes'


@admin.register(Event)
class EventAdmin(CRUDActionsMixin, ModelAdmin):
    list_display   = ('title', 'event_type', 'start_datetime', 'end_datetime', 'status', 'is_client_meeting', 'client_approval', 'project', 'lead')
    list_filter    = ('event_type', 'status', 'is_client_meeting', 'client_approval')
    search_fields  = ('title', 'description', 'location')
    ordering       = ('start_datetime',)
    readonly_fields = ('created_by', 'created_at', 'updated_at')
    inlines        = [AttendeeInline]

    fieldsets = (
        (None, {
            'fields': ('title', 'description', ('event_type', 'status'), ('start_datetime', 'end_datetime'), 'location'),
        }),
        ('Vinculación', {
            'fields': ('project', 'lead'),
        }),
        ('Portal del cliente', {
            'fields': ('is_client_meeting', 'client_approval', 'client_notes'),
            'classes': ['collapse'],
        }),
        ('Auditoría', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ['collapse'],
        }),
    )

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
