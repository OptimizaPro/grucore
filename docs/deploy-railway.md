# Deploy en Railway — Grucore

Monorepo con dos servicios independientes desplegados en Railway.

## Arquitectura

```
grucore/                         ← git root (subido por railway up)
├── Dockerfile                   ← build del backend Django
├── Dockerfile.frontend          ← build del frontend Next.js
├── .railwayignore               ← excluye archivos grandes del upload
├── backend/                     ← servicio: backend
│   ├── .railway/railway.ts      ← IaC config (builder: dockerfile)
│   └── railway.json             ← deprecated, reemplazado por IaC
└── frontend/                    ← servicio: frontend
    └── railway.json             ← Nixpacks config (no usado — usamos Dockerfile)
```

## Servicios en Railway

| Servicio  | Builder    | Dockerfile          | Puerto | URL                                          |
|-----------|------------|---------------------|--------|----------------------------------------------|
| backend   | Dockerfile | `Dockerfile`        | 8000   | `https://backend-production-ae40c.up.railway.app` |
| frontend  | Dockerfile | `Dockerfile.frontend` | 8080 | `https://frontend-production-38fd7.up.railway.app` |
| Postgres  | Image      | —                   | 5432   | interno (`postgres.railway.internal`)        |
| Redis     | Image      | —                   | 6379   | interno (`redis.railway.internal`)           |

## Dominios personalizados

| Dominio             | Apunta a              | CNAME target               |
|---------------------|-----------------------|----------------------------|
| `grucore.com`       | frontend (port 8080)  | `im84nobx.up.railway.app`  |
| `www.grucore.com`   | frontend (port 8080)  | `dvh98ets.up.railway.app`  |

## Variables de entorno

### Backend (`backend` service)

| Variable                  | Descripción                                  |
|---------------------------|----------------------------------------------|
| `DJANGO_SECRET_KEY`       | Secret key de producción                     |
| `DEBUG`                   | `False`                                      |
| `DJANGO_ALLOWED_HOSTS`    | `grucore.com,*.railway.app,localhost`        |
| `DJANGO_SETTINGS_MODULE`  | `grucore.settings.production`                |
| `DATABASE_URL`            | Inyectado automáticamente por Railway Postgres |
| `REDIS_URL`               | Inyectado automáticamente por Railway Redis  |
| `CORS_ALLOWED_ORIGINS`    | `https://grucore.com,https://frontend-production-38fd7.up.railway.app` |
| `USE_S3`                  | `True`                                       |
| `SUPABASE_S3_ENDPOINT`    | `https://rvprwttonwjolnwwrshp.supabase.co/storage/v1/s3` |
| `SUPABASE_S3_BUCKET`      | `grucore-media`                              |
| `SUPABASE_S3_REGION`      | `us-east-1`                                  |
| `SUPABASE_ACCESS_KEY_ID`  | Access key de Supabase Storage               |
| `SUPABASE_SECRET_ACCESS_KEY` | Secret key de Supabase Storage            |
| `EMAIL_HOST`              | `smtp-relay.brevo.com`                       |
| `EMAIL_PORT`              | `587`                                        |
| `EMAIL_HOST_USER`         | Login SMTP de Brevo (`xxx@smtp-brevo.com`)   |
| `EMAIL_HOST_PASSWORD`     | SMTP key de Brevo                            |
| `DEFAULT_FROM_EMAIL`      | `noreply@grucore.com`                        |
| `RAILWAY_DOCKERFILE_PATH` | `Dockerfile`                                 |

### Frontend (`frontend` service)

| Variable               | Descripción                                      |
|------------------------|--------------------------------------------------|
| `NEXT_PUBLIC_API_URL`  | `https://backend-production-ae40c.up.railway.app` |
| `NEXTAUTH_URL`         | `https://grucore.com`                            |
| `NEXTAUTH_SECRET`      | Secret aleatorio (32+ chars)                     |
| `NODE_ENV`             | `production`                                     |
| `RAILWAY_DOCKERFILE_PATH` | `Dockerfile.frontend`                         |

## Cómo redesplegar

Railway sube siempre desde el **git root**, no desde el subdirectorio.

### Backend

```bash
cd backend
railway service link backend   # primera vez o si cambió el link
railway up --detach
railway logs                   # verificar migración + gunicorn
```

### Frontend

```bash
cd ..   # volver a la raíz del repo
railway service link frontend
railway up --detach
railway logs
```

### Verificar estado de ambos servicios

```bash
railway service list --json | jq '.[].name, .[].status'
```

## Flujo de build

### Backend (`Dockerfile`)

```
python:3.12-slim
  → apt-get install (gcc, libpq-dev, libpango, libcairo …)
  → pip install -r backend/requirements.txt
  → COPY backend/ /app
  → CMD: migrate → collectstatic → gunicorn :${PORT:-8000}
```

### Frontend (`Dockerfile.frontend`)

```
node:20-alpine (builder)
  → npm install --legacy-peer-deps
  → COPY frontend/ /app
  → next build  (standalone output)

node:20-alpine (runner)
  → COPY .next/standalone
  → COPY .next/static
  → COPY public
  → CMD: node server.js
```

> **Nota:** `npm ci` falla con la lock file actual — usar `npm install --legacy-peer-deps`.

## Problemas resueltos

| Problema | Causa | Solución |
|----------|-------|----------|
| Railway usaba Nixpacks en backend | Sin Dockerfile en raíz | Crear `Dockerfile` en raíz con `COPY backend/` |
| `COPY requirements.txt` fallaba | Build context era la raíz, no `backend/` | Mover Dockerfile a raíz y ajustar paths |
| Frontend fallaba con TypeScript | Strict mode en `next build` | `typescript.ignoreBuildErrors: true` en `next.config.ts` |
| `/erp/crm` rompía el build | `useSearchParams()` sin Suspense boundary | `export const dynamic = 'force-dynamic'` en `erp/layout.tsx` |
| "Application failed to respond" | Dominio apuntaba al puerto 3000, app en 8080 | `railway domain update grucore.com --port 8080` |
| S3 vars no encontradas | Settings usaban `SUPABASE_S3_ACCESS_KEY`, Railway tenía `SUPABASE_ACCESS_KEY_ID` | Actualizar `base.py` para usar nombres nuevos |
| TXT de verificación incorrecto | Se copió valor truncado con `...` | Copiar siempre el valor completo desde el output de `railway domain` |

## DNS en NameCheap

Registros activos para `grucore.com`:

```
CNAME  @                    im84nobx.up.railway.app
CNAME  www                  dvh98ets.up.railway.app
TXT    _railway-verify      railway-verify=1e129fe6005e7f104ff1954ab799d3b9b57b7ea9c61b43506f8cbdd28ddaa3e4
TXT    _railway-verify.www  railway-verify=89928f88f11868614c9293505138fda83b2dc888a26e209e84ee52476d08eb64
```

> Brevo DKIM/DMARC — configurados y verificados en una sesión anterior.

## Comandos útiles

```bash
# Ver variables de un servicio
railway variables

# Ver logs en tiempo real
railway logs --tail

# Estado de los dominios
railway domain list
railway domain status <domain-id>

# Forzar reintento de certificado (solo si status = FAILED)
railway domain certificate retry grucore.com

# Crear superusuario Django en producción
railway run python manage.py createsuperuser

# Ejecutar comando en el contenedor
railway run python manage.py shell
```
