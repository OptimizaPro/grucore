# Image Management — Grucore ERP

## Overview

All public images (portfolio covers, gallery photos, CMS section images) are served from
our own infrastructure instead of third-party CDNs (Unsplash, etc.).

| Environment | Storage backend           | URL pattern                                         |
|-------------|---------------------------|-----------------------------------------------------|
| Development | Local filesystem          | `http://localhost:8000/media/assets/YYYY/MM/<file>` |
| Production  | Supabase Storage (S3-compat) | `https://<project>.supabase.co/storage/v1/object/public/<bucket>/<file>` |

The routing is automatic — set `USE_S3=True` in the production `.env` and all
`ImageField.url` calls return the Supabase CDN URL.

---

## Architecture

```
Admin UI (Unfold)
    │  upload image
    ▼
MediaAsset  (apps/media_assets/models.py)
    │  file = ImageField → django-storages routes to:
    │      dev  → MEDIA_ROOT/assets/YYYY/MM/
    │      prod → Supabase Storage bucket
    │
    ├── FK ◄── Block.image_asset   (apps/cms/models.py)
    │           block_type = 'image_asset'
    │           serializer returns block value = asset.url
    │
    └── FK ◄── PortfolioProject.cover_image   (apps/portfolio/models.py)
                PortfolioImage.asset
                serializer returns cover_url / gallery[].url
```

### Key models

| Model              | App               | Purpose                                    |
|--------------------|-------------------|--------------------------------------------|
| `MediaAsset`       | `media_assets`    | Master registry of all uploaded images     |
| `PortfolioProject` | `portfolio`       | Public portfolio case studies              |
| `PortfolioImage`   | `portfolio`       | Gallery images per portfolio project       |
| `Block`            | `cms`             | CMS content blocks (text, image, url, …)   |

---

## API endpoints

| Method | URL                           | Description                        |
|--------|-------------------------------|------------------------------------|
| GET    | `/api/media-assets/`          | List all media assets (id, name, url, alt) |
| GET    | `/api/media-assets/<id>/`     | Single asset detail                |
| GET    | `/api/portfolio/`             | Published portfolio projects       |
| GET    | `/api/portfolio/?type=<type>` | Filter by project type             |
| GET    | `/api/portfolio/?featured=true` | Featured projects only           |
| GET    | `/api/portfolio/<slug>/`      | Project detail + gallery           |

All endpoints are public (`AllowAny`) — no authentication required for reads.

---

## Django settings (base.py)

```python
USE_S3 = env.bool('USE_S3', default=False)

if USE_S3:
    STORAGES = {
        'default': {
            'BACKEND': 'storages.backends.s3boto3.S3Boto3Storage',
            'OPTIONS': {
                'endpoint_url': env('SUPABASE_S3_ENDPOINT'),
                'bucket_name':  env('SUPABASE_S3_BUCKET'),
                'access_key':   env('SUPABASE_ACCESS_KEY_ID'),
                'secret_key':   env('SUPABASE_SECRET_ACCESS_KEY'),
                'region_name':  env('SUPABASE_S3_REGION', default='ap-southeast-1'),
                'default_acl':  'public-read',
                'file_overwrite': False,
            },
        },
        ...
    }
    MEDIA_URL = f"{env('SUPABASE_S3_ENDPOINT')}/{env('SUPABASE_S3_BUCKET')}/"
```

### Required .env variables (production)

```
USE_S3=True
SUPABASE_S3_ENDPOINT=https://<project-ref>.supabase.co/storage/v1/s3
SUPABASE_S3_BUCKET=grucore-media
SUPABASE_ACCESS_KEY_ID=<access-key>
SUPABASE_SECRET_ACCESS_KEY=<secret-key>
SUPABASE_S3_REGION=ap-southeast-1
```

To get the S3 credentials in Supabase:
1. Dashboard → Storage → Settings → S3 Access
2. Generate new access key pair
3. Copy endpoint, bucket name, key ID, secret

---

## Frontend usage

### Portfolio list page

```ts
import { getPortfolioProjects } from '@/lib/portfolio'

const projects = await getPortfolioProjects()
// projects[0].cover_url → Supabase CDN URL in prod, /media/... in dev
```

### Portfolio detail page

```ts
import { getPortfolioProject } from '@/lib/portfolio'

const project = await getPortfolioProject(params.slug)
// project.gallery[0].url → full CDN URL
```

### CMS image block

When a `Block` has `block_type = 'image_asset'` and `image_asset` set,
the CMS serializer returns the asset URL directly as the block value:

```ts
const page = await getCMSPage('home')
const heroImage = page.sections.hero.blocks.bg_image
// → 'https://<supabase-cdn>/...jpg'
```

---

## Admin workflow

1. **Upload image**: Admin → Recursos Multimedia → + Añadir
   - Upload file (JPG/PNG/WebP)
   - Fill `alt_es` / `alt_en` for accessibility
   - Copy the public URL shown in the "URL pública" field

2. **Assign to portfolio project**: Admin → Portafolio → Proyectos → select project
   - Set `Imagen de portada` → pick from MediaAsset list
   - Add gallery images in the inline table

3. **Assign to CMS block**: Admin → CMS → Bloques → select block
   - Change `block_type` to `Imagen (MediaAsset)`
   - Select asset in `Activo de imagen` field
   - Leave `value_es` / `value_en` empty for image_asset blocks

---

## Migrations needed

After pulling this branch, run:

```bash
make migrate
# or
docker compose exec backend python manage.py makemigrations media_assets portfolio cms
docker compose exec backend python manage.py migrate
```

---

## Future improvements

- [ ] Image optimization: auto-generate WebP variants on upload (Pillow + post-save signal)
- [ ] Soft-delete: mark assets as archived instead of hard-delete to avoid broken references
- [ ] Bulk upload endpoint with multipart form
- [ ] Alt text auto-suggestion via Claude Vision API
