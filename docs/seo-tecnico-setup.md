# SEO Técnico — Grucore

**Fecha:** 2026-11-02

## Resumen

Setup completo de SEO técnico base para `grucore.com`: sitemap dinámico con hreflang `es`/`en`, robots.txt con protección de rutas privadas, y propiedad verificada en Google Search Console.

---

## Sitemap.xml

**Archivo:** `frontend/src/app/sitemap.ts`

Next.js genera `/sitemap.xml` automáticamente en build time.

### Páginas estáticas

| URL (es)      | URL (en)        | Frecuencia | Prioridad |
|---------------|-----------------|------------|-----------|
| `/`           | `/en`           | monthly    | 1.0       |
| `/servicios`  | `/en/services`  | monthly    | 0.9       |
| `/proyectos`  | `/en/projects`  | weekly     | 0.9       |
| `/nosotros`   | `/en/about`     | monthly    | 0.7       |
| `/contacto`   | `/en/contact`   | monthly    | 0.8       |
| `/cotizar`    | —               | monthly    | 0.6       |
| `/privacy`    | `/privacy`      | yearly     | 0.2       |
| `/terms`      | `/terms`        | yearly     | 0.2       |

### Páginas dinámicas

- **Servicios** — slugs de `SERVICES` en `lib/estimator.ts`: `residential`, `remodeling`, `commercial`, `design_build`, `industrial`, `kitchens_baths`
- **Proyectos** — slugs de `PROJECTS` en `lib/projects-data.ts`: 6 proyectos actuales

### Hreflang

Cada entrada incluye `alternates.languages` con `es` y `en`. El español sin prefijo (`/servicios`), el inglés con `/en` (`/en/services`). Verificable en el código fuente del sitemap (`Ctrl+U` en el navegador).

---

## Robots.txt

**Archivo:** `frontend/src/app/robots.ts`

Next.js genera `/robots.txt` automáticamente.

```
User-Agent: *
Allow: /
Disallow: /erp/
Disallow: /portal/
Disallow: /djamasy/

Sitemap: https://grucore.com/sitemap.xml
```

Las rutas `/erp/`, `/portal/` y `/djamasy/` son áreas privadas (ERP interno, portal de clientes, admin Django) que no deben indexarse.

---

## Google Search Console

### Verificación del dominio

1. Ir a [search.google.com/search-console](https://search.google.com/search-console)
2. Añadir propiedad → tipo **Dominio** → ingresar `grucore.com`
3. GSC proporciona un código `google-site-verification=XXXXXXXXXX`
4. En **Namecheap** → Advanced DNS → añadir registro TXT:
   - **Host:** `@`
   - **Value:** el código de verificación completo
   - **TTL:** Automatic
5. Volver a GSC → **Verificar**

La propiedad `grucore.com` está verificada y activa.

### Registro del sitemap

1. Search Console → propiedad `grucore.com`
2. Panel izquierdo → **Sitemaps**
3. Pegar `https://grucore.com/sitemap.xml` → **Enviar**

Estado: enviado y siendo procesado por Google.

---

## Variables de entorno y deploy

### Variable requerida

| Variable               | Valor                 |
|------------------------|-----------------------|
| `NEXT_PUBLIC_SITE_URL` | `https://grucore.com` |

Usar el dominio de producción sin barra final. `sitemap.ts` y `robots.ts` la leen en build time — si no está definida, el fallback hardcodeado es `https://grucore.com`.

### Actualizar en Railway

1. Railway → proyecto Grucore → servicio **frontend**
2. Pestaña **Variables** → editar o crear `NEXT_PUBLIC_SITE_URL`
3. Guardar → Railway lanza redeploy automático
4. Si el valor cambia después del deploy, forzar redeploy: **Deployments → Redeploy**

> `NEXT_PUBLIC_*` se embebe en el bundle durante el build, no en runtime.
