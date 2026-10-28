# Gestión de imágenes de servicios

## Arquitectura

Las imágenes de servicios se gestionan en dos capas:

1. **MediaAsset** (`/admin/media_assets/mediaasset/`) — repositorio central de archivos.
   - En desarrollo: filesystem local en `backend/media/assets/`
   - En producción: Supabase Storage (automático vía `USE_S3=True`)

2. **ServicePage** (`/admin/cms/servicepage/`) — asigna las 3 imágenes de cada servicio.
   - `cover_image` — imagen de portada (hero de la página de servicio)
   - `before_image` — imagen "Antes" del slider
   - `after_image` — imagen "Después" del slider

El frontend siempre llama primero al CMS. Si un campo es `null`, cae en el valor
hardcodeado de `frontend/src/lib/estimator.ts` como fallback.

---

## Poblar desde cero (seed)

Las imágenes fuente deben estar en `backend/fixtures/service_images/`.

```bash
# Primera vez
python manage.py seed_service_images

# Re-subir aunque ya existan los registros
python manage.py seed_service_images --force

# Usar un directorio alternativo
python manage.py seed_service_images --source /ruta/a/imagenes
```

El comando:
- Crea un `MediaAsset` por cada rol (portada, antes, después) de cada servicio
- Crea o actualiza los 6 registros de `ServicePage`
- Asigna el primer superuser como `uploaded_by`

### Servicios y archivos fuente esperados

| Slug | Portada | Antes | Después |
|---|---|---|---|
| `residential_construction` | `residencial-despues.png` | `residencial-antes.webp` | `residencial-despues.png` |
| `remodeling` | `remodelacion-despues.png` | `remodelacion-antes.webp` | `remodelacion-despues.png` |
| `commercial` | `comercial-despues.png` | `comercial-antes.webp` | `comercial-despues.png` |
| `design_build` | `design-build-despues.jpg` | `design-build-antes.png` | `design-build-despues.jpg` |
| `industrial` | `industrial-despues.png` | `industrial-antes.webp` | `industrial-despues.png` |
| `kitchens_baths` | `cocina-despues.jpg` | `cocina-antes.png` | `cocina-despues.jpg` |

---

## Actualizar imágenes manualmente desde el admin

### Subir una nueva imagen

1. Ir a **Recursos multimedia → Añadir**
2. Subir el archivo (JPG, PNG o WebP)
3. Completar nombre y texto alt en ES/EN
4. Guardar

### Asignar imágenes a un servicio

1. Ir a **CMS → Imágenes por servicio**
2. Seleccionar el servicio o crear nuevo
3. Asignar los assets en los campos Portada / Antes / Después
4. Guardar

Los cambios se reflejan en el frontend en la próxima solicitud (dev: inmediato; prod: ISR cada 1 hora o al revalidar).

---

## Añadir un nuevo servicio

1. Agregar el slug y label a `SERVICE_SLUGS` en `backend/apps/cms/models.py`
2. Agregar la definición completa en `SERVICES` en `frontend/src/lib/estimator.ts`
3. Agregar el mapeo de imágenes en `SERVICE_MAP` dentro de `seed_service_images.py`
4. Ejecutar `python manage.py makemigrations cms` (actualiza el `choices` del campo `slug`)
5. Ejecutar `python manage.py migrate`
6. Subir imágenes al admin o ejecutar el seed

---

## Producción (Supabase Storage)

Con `USE_S3=True` en el `.env`, `MediaAsset.file` usa `django-storages` con el backend
S3Boto3 apuntando a Supabase. La propiedad `.url` devuelve la URL pública del CDN.

Variables de entorno requeridas:

```env
USE_S3=True
SUPABASE_S3_ENDPOINT=https://<project>.supabase.co/storage/v1/s3
SUPABASE_S3_BUCKET=media
AWS_ACCESS_KEY_ID=<supabase-access-key>
AWS_SECRET_ACCESS_KEY=<supabase-secret-key>
AWS_S3_REGION_NAME=us-east-1
```
