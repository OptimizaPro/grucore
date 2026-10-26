from django.contrib import admin
from unfold.admin import ModelAdmin
from apps.core.admin_mixins import CRUDActionsMixin
from .models import Notification, ProjectMessage


@admin.register(Notification)
class NotificationAdmin(CRUDActionsMixin, ModelAdmin):
    list_display   = ('notification_type', 'title', 'recipient', 'is_read', 'project', 'created_at')
    list_filter    = ('notification_type', 'is_read', 'project')
    search_fields  = ('title', 'body')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at',)

    fieldsets = (
        (None, {
            "fields": (
                ("notification_type", "is_read"),
                ("recipient", "project"),
                "title",
                "body",
                "action_url",
                "created_at",
            ),
        }),
    )


@admin.register(ProjectMessage)
class ProjectMessageAdmin(CRUDActionsMixin, ModelAdmin):
    list_display   = ('author', 'project', 'parent', 'created_at')
    list_filter    = ('project',)
    search_fields  = ('body',)
    date_hierarchy = 'created_at'
    readonly_fields = ('author', 'created_at', 'updated_at')

    fieldsets = (
        (None, {
            "fields": (
                ("project", "author"),
                "parent",
                "body",
                ("created_at", "updated_at"),
            ),
        }),
    )
