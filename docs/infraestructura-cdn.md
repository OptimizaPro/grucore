# Infraestructura CDN y escalabilidad White Label / SaaS

## Estado actual

| Capa | Servicio | CDN incluido |
|---|---|---|
| Frontend | Railway | No (Railway no tiene CDN Edge; usar Cloudflare delante si se necesita) |
| Media / imágenes | Supabase Storage | Sí (CDN básico) |
| Backend API | Railway | No necesario |

Para un solo cliente (Grucore), la infraestructura actual es suficiente. Añadir Cloudflare ahora sería overhead sin beneficio real.

---

## Cuándo y por qué incorporar Cloudflare

### Trigger: primer cliente White Label

El momento de actuar es cuando se onboardee el primer cliente WL, no antes.

### 1. Cloudflare R2 — reemplazar Supabase Storage

**El argumento más fuerte.** R2 es 100% compatible con S3 (misma API). El código ya está preparado — `MediaAsset` usa `django-storages` con backend S3Boto3. La migración es cambiar 4 variables de entorno.

| | Supabase Storage | Cloudflare R2 |
|---|---|---|
| Almacenamiento | $0.021/GB | $0.015/GB |
| Egress | $0.09/GB | **$0 (gratuito)** |
| Requests | Incluido | $0.36/millón |

En un SaaS con 20 clientes y uso intensivo de imágenes, el egress de Supabase se convierte en el costo dominante. R2 lo elimina.

**Cambio de variables de entorno (sin refactor de código):**
```env
# Supabase Storage (actual)
SUPABASE_S3_ENDPOINT=https://<project>.supabase.co/storage/v1/s3
SUPABASE_S3_BUCKET=media
AWS_ACCESS_KEY_ID=<supabase-key>
AWS_SECRET_ACCESS_KEY=<supabase-secret>

# Cloudflare R2 (migración)
SUPABASE_S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
SUPABASE_S3_BUCKET=grucore-media
AWS_ACCESS_KEY_ID=<r2-access-key>
AWS_SECRET_ACCESS_KEY=<r2-secret-key>
AWS_S3_REGION_NAME=auto
```

### 2. Dominios custom por cliente

Cada cliente White Label necesita su propio dominio (`erp.constructoraX.com`). Cloudflare tiene la API de DNS más rápida y completa del mercado. El onboarding automatizado crearía el subdominio via API sin intervención manual.

### 3. SSL automático por dominio custom

Cada nuevo dominio WL necesita certificado SSL. Cloudflare lo gestiona automáticamente mediante su API — sin Let's Encrypt manual, sin renovaciones, sin configuración por cliente.

### 4. Rate limiting y protección de API por tenant

En un SaaS multi-tenant es necesario proteger el backend por cliente. Cloudflare Workers puede enrutar y throttlear por dominio antes de que el request llegue a Railway, sin añadir lógica al backend Django.

---

## Hoja de ruta por etapa

| Etapa | Acción |
|---|---|
| **Ahora** | No hacer nada. Foco en producto y validación de mercado. |
| **Primer cliente WL** | Migrar Supabase Storage → Cloudflare R2. Registrar dominio del cliente en Cloudflare. |
| **3+ clientes WL** | Automatizar DNS + SSL via Cloudflare API en el flujo de onboarding. |
| **SaaS público** | Añadir Cloudflare Workers para tenant routing y rate limiting por cliente. |

---

## Notas técnicas

- La migración de Supabase Storage → R2 **no requiere cambios en el código Django**. El modelo `MediaAsset` y el backend `S3Boto3` son agnósticos al proveedor S3.
- Railway no incluye CDN Edge para el frontend. Si se necesita CDN para assets estáticos del frontend, añadir Cloudflare delante de Railway es la opción natural y no añade complejidad operativa.
- Railway no necesita CDN: es un servidor de API, no sirve assets estáticos en producción.
- El skill `/wl-onboarding` deberá actualizarse para incluir la creación del dominio via Cloudflare API cuando se implemente la automatización.
