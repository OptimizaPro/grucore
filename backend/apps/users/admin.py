from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from unfold.admin import ModelAdmin
from apps.core.admin_mixins import CRUDActionsMixin
from .models import User
from .widgets import DragDropImageWidget


class UserAdminForm(forms.ModelForm):
    class Meta:
        model   = User
        fields  = '__all__'
        widgets = {
            'avatar': DragDropImageWidget,
        }


@admin.register(User)
class UserAdmin(CRUDActionsMixin, ModelAdmin, BaseUserAdmin):
    form          = UserAdminForm
    list_display  = ('email', 'full_name', 'role', 'is_active', 'created_at')
    list_filter   = ('role', 'is_active', 'preferred_language', 'preferred_currency')
    search_fields = ('email', 'first_name', 'last_name', 'username')
    ordering      = ('email',)

    fieldsets = (
        ("Identidad", {
            "fields": (
                ("first_name", "last_name"),
                ("email", "username"),
            ),
        }),
        ("Rol & Contacto", {
            "fields": (
                ("role", "phone"),
                "avatar",
                "avatar_url",
                ("preferred_language", "preferred_currency"),
            ),
        }),
        ("Acceso", {
            "fields": (
                "password",
                ("is_active", "is_staff", "is_superuser"),
            ),
        }),
        ("Permisos", {
            "fields": (
                "groups",
                "user_permissions",
            ),
            "classes": ["collapse"],
        }),
        ("Fechas", {
            "fields": (
                ("last_login", "date_joined"),
            ),
            "classes": ["collapse"],
        }),
    )

    add_fieldsets = (
        (None, {
            "fields": (
                ("first_name", "last_name"),
                ("email", "username"),
                "role",
                ("password1", "password2"),
            ),
        }),
    )
