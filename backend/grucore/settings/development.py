from .base import *  # noqa

DEBUG = True

# En desarrollo: Django sirve los estáticos directamente desde STATICFILES_DIRS.
# WhiteNoise se elimina del middleware para que los cambios en CSS se reflejen sin collectstatic.
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'
MIDDLEWARE = [m for m in MIDDLEWARE if 'whitenoise' not in m.lower()]  # noqa

CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
]

CORS_ALLOW_CREDENTIALS = True

# En desarrollo, permitir todos los headers
CORS_ALLOW_ALL_ORIGINS = False

# Django Admin disponible en desarrollo
INSTALLED_APPS += []  # noqa

# Logs más verbosos en desarrollo
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'apps': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}
