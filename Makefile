.PHONY: help up down build logs shell-be shell-fe migrate createsuperuser

help:
	@echo "Comandos disponibles:"
	@echo "  make up            — Levanta todos los servicios"
	@echo "  make down          — Detiene todos los servicios"
	@echo "  make build         — Reconstruye las imágenes Docker"
	@echo "  make logs          — Muestra logs en tiempo real"
	@echo "  make shell-be      — Shell de Django"
	@echo "  make shell-fe      — Shell del contenedor Next.js"
	@echo "  make migrate       — Crea y aplica migraciones"
	@echo "  make superuser     — Crea superusuario de Django"
	@echo "  make test-be       — Corre tests del backend"

up:
	docker compose up

up-d:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build --no-cache

logs:
	docker compose logs -f

logs-be:
	docker compose logs -f backend celery

logs-fe:
	docker compose logs -f frontend

shell-be:
	docker compose exec backend python manage.py shell

shell-fe:
	docker compose exec frontend sh

migrate:
	docker compose exec backend python manage.py makemigrations
	docker compose exec backend python manage.py migrate

superuser:
	docker compose exec backend python manage.py createsuperuser

test-be:
	docker compose exec backend python manage.py test apps/

collectstatic:
	docker compose exec backend python manage.py collectstatic --noinput
