# Comandos Docker — Grucore

Equivalencias de `make` para Windows (donde `make` no está disponible).

## Servicios

| Acción                 | Comando                           |
|------------------------|-----------------------------------|
| Levantar servicios     | `docker compose up`               |
| Levantar en background | `docker compose up -d`            |
| Detener servicios      | `docker compose down`             |
| Reconstruir imágenes   | `docker compose build --no-cache` |

## Logs

| Acción              | Comando                                 |
|---------------------|-----------------------------------------|
| Todos los logs      | `docker compose logs -f`                |
| Solo backend/celery | `docker compose logs -f backend celery` |
| Solo frontend       | `docker compose logs -f frontend`       |

## Django

> **Nota:** `migrate` se ejecuta automáticamente al arrancar el contenedor `backend`.
> Solo necesitas `makemigrations` cuando añades o modificas modelos.

| Acción                             | Comando                                                                |
|------------------------------------|------------------------------------------------------------------------|
| Shell de Django                    | `docker compose exec backend python manage.py shell`                   |
| Crear migraciones (todos los apps) | `docker compose exec backend python manage.py makemigrations`          |
| Crear migraciones (app específica) | `docker compose exec backend python manage.py makemigrations users`    |
| Aplicar migraciones manualmente    | `docker compose exec backend python manage.py migrate`                 |
| Ver migraciones pendientes         | `docker compose exec backend python manage.py showmigrations`          |
| Crear superusuario                 | `docker compose exec backend python manage.py createsuperuser`         |
| Collectstatic                      | `docker compose exec backend python manage.py collectstatic --noinput` |
| Correr tests                       | `docker compose exec backend python manage.py test apps/`              |

## Next.js

| Acción               | Comando                           |
|----------------------|-----------------------------------|
| Shell del contenedor | `docker compose exec frontend sh` |

## Utilidades Windows

Generar secret key (alternativa a `openssl rand -base64 32`):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Instalar `make` en Windows (opcional):

```bash
choco install make
```
