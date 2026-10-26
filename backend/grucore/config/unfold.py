from django.http import HttpRequest
from django.templatetags.static import static


def logo_light(request: HttpRequest) -> str:
    return static("images/Grucore.png")


def logo_dark(request: HttpRequest) -> str:
    return static("images/Grucore-Negativo.png")


def favicon(request: HttpRequest) -> str:
    return static("images/favicon.ico")


def environment_callback(request: HttpRequest) -> list[str]:
    """Muestra etiqueta de entorno en el header del admin."""
    from django.conf import settings

    if getattr(settings, "DEBUG", False):
        return ["Desarrollo", "warning"]

    return ["Producción", "success"]
