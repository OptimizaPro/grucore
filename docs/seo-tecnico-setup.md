# SEO Técnico — Grucore

**Última actualización:** 2026-11-02

## Checklist de implementación

| # | Elemento | Estado | Archivo |
|---|---|---|---|
| 1 | `sitemap.xml` con hreflang es/en | ✅ | `app/sitemap.ts` |
| 2 | `robots.txt` con rutas privadas bloqueadas | ✅ | `app/robots.ts` |
| 3 | Google Search Console verificado + sitemap enviado | ✅ | — |
| 4 | Schema `GeneralContractor` (Organization + LocalBusiness) | ✅ | `app/[locale]/layout.tsx` |
| 5 | `llms.txt` para crawlers de IA | ✅ | `public/llms.txt` |
| 6 | OpenGraph + Twitter cards + canonical en todas las páginas | ✅ | `lib/metadata.ts` |
| 7 | Schema `Service` + `FAQPage` en páginas de servicio | ✅ | `app/[locale]/services/[slug]/page.tsx` |
| 8 | OG Images dinámicas (páginas públicas + servicios) | ✅ | `app/[locale]/opengraph-image.tsx` |

---

## 1. Sitemap.xml

**Archivo:** `frontend/src/app/sitemap.ts`

Next.js genera `/sitemap.xml` automáticamente en build time.

### Páginas estáticas

| URL (es) | URL (en) | Frecuencia | Prioridad |
|---|---|---|---|
| `/` | `/en` | monthly | 1.0 |
| `/servicios` | `/en/services` | monthly | 0.9 |
| `/proyectos` | `/en/projects` | weekly | 0.9 |
| `/nosotros` | `/en/about` | monthly | 0.7 |
| `/contacto` | `/en/contact` | monthly | 0.8 |
| `/cotizar` | — | monthly | 0.6 |
| `/privacy` | `/privacy` | yearly | 0.2 |
| `/terms` | `/terms` | yearly | 0.2 |

### Páginas dinámicas

- **Servicios** — slugs de `SERVICES` en `lib/estimator.ts`: `residential`, `remodeling`, `commercial`, `design_build`, `industrial`, `kitchens_baths`
- **Proyectos** — slugs de `PROJECTS` en `lib/projects-data.ts`: 6 proyectos actuales

### Hreflang

Cada entrada incluye `alternates.languages` con `es` y `en`. El español sin prefijo (`/servicios`), el inglés con `/en` (`/en/services`). Verificable en el código fuente del sitemap (`Ctrl+U` en el navegador).

---

## 2. Robots.txt

**Archivo:** `frontend/src/app/robots.ts`

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

## 3. Google Search Console

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

---

## 4. Schema JSON-LD — GeneralContractor

**Archivo:** `frontend/src/app/[locale]/layout.tsx`

Inyectado en `<head>` en todas las páginas públicas. Los datos se leen dinámicamente desde `CompanySettings` (CMS).

```json
{
  "@context": "https://schema.org",
  "@type": "GeneralContractor",
  "name": "Grucore",
  "description": "...",
  "url": "https://grucore.com",
  "logo": "...",
  "telephone": "...",
  "email": "...",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "...",
    "addressCountry": "GT"
  },
  "areaServed": { "@type": "Country", "name": "Guatemala" },
  "sameAs": ["instagram_url", "linkedin_url", "facebook_url"]
}
```

`GeneralContractor` hereda de `LocalBusiness` → `Organization`. Verificar en [search.google.com/test/rich-results](https://search.google.com/test/rich-results).

---

## 5. llms.txt (GEO)

**Archivo:** `frontend/public/llms.txt` → sirve en `https://grucore.com/llms.txt`

Describe el negocio, servicios y páginas para crawlers de ChatGPT, Perplexity, Claude y otros LLMs. Sigue el estándar emergente `llms.txt`.

---

## 6. OpenGraph + Twitter Cards + Canonical

**Archivo helper:** `frontend/src/lib/metadata.ts` — función `buildMetadata()`

Todas las páginas públicas usan el helper. Genera:
- `openGraph`: título, descripción, URL canonical, siteName, locale (`es_GT` / `en_US`), imagen
- `twitter`: `summary_large_image` cuando hay imagen, `summary` si no
- `alternates.canonical`: URL canónica de la página
- `alternates.languages`: hreflang `es` y `en` en el `<head>`

### Cobertura por página

| Página | Canonical (es) | OG Image |
|---|---|---|
| Home | `/` | OG Image dinámica (`opengraph-image.tsx`) |
| Servicios | `/servicios` | OG Image dinámica |
| Proyectos | `/proyectos` | OG Image dinámica |
| Nosotros | `/nosotros` | OG Image dinámica |
| Contacto | `/contacto` | OG Image dinámica |
| Cotizar | `/cotizar` | OG Image dinámica |
| Servicio detalle | `/servicios/[slug]` | OG Image dinámica por servicio |
| Proyecto detalle | `/proyectos/[slug]` | `project.cover_image` (foto real) |

---

## 7. Schema Service + FAQPage

**Archivo:** `frontend/src/app/[locale]/services/[slug]/page.tsx`

Dos JSON-LD scripts inyectados en el `return` de cada página de servicio:

### Service

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Construcción Residencial",
  "description": "...",
  "url": "https://grucore.com/servicios/residential",
  "image": "...",
  "provider": { "@type": "Organization", "name": "Grucore", "url": "https://grucore.com" },
  "areaServed": { "@type": "Country", "name": "Guatemala" },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "GTQ",
    "priceRange": "Q300,000 – Q2,500,000",
    "availability": "https://schema.org/InStock"
  }
}
```

### FAQPage

4 preguntas/respuestas por servicio, locale-aware (`es`/`en`). Los datos viven en la constante `FAQ_BY_SERVICE` dentro del mismo archivo.

---

## 8. OG Images dinámicas

Generadas con `ImageResponse` de `next/og` (runtime Node.js). Usan Montserrat cargada desde Google Fonts y el logo `Grucore-white.png` desde `/public/`.

### Default — páginas estáticas

**Archivo:** `frontend/src/app/[locale]/opengraph-image.tsx`

Aplica a: home, servicios, proyectos, nosotros, contacto, cotizar.

- Fondo oscuro `#1A2530`
- Barra naranja superior
- Logo Grucore blanco centrado
- Tagline: "Construcción y Remodelación Premium"
- "Guatemala" en naranja
- URL y "Consulta gratuita en 24h" en pie

### Servicio detalle

**Archivo:** `frontend/src/app/[locale]/services/[slug]/opengraph-image.tsx`

- Nombre del servicio (grande, bold)
- Descripción
- Rango de inversión en GTQ
- Duración típica
- Logo Grucore en esquina superior derecha
- Barra naranja izquierda

### Verificar imágenes generadas

Acceder directamente a:
- `https://grucore.com/opengraph-image.png`
- `https://grucore.com/servicios/residential/opengraph-image.png`

O pegar cualquier URL en [opengraph.xyz](https://www.opengraph.xyz).

---

## Variables de entorno

| Variable | Valor | Usado en |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://grucore.com` | `sitemap.ts`, `robots.ts`, `metadata.ts`, JSON-LD schemas, OG images |

### Actualizar en Railway

1. Railway → proyecto Grucore → servicio **frontend**
2. Pestaña **Variables** → editar o crear `NEXT_PUBLIC_SITE_URL`
3. Guardar → Railway lanza redeploy automático

> `NEXT_PUBLIC_*` se embebe en el bundle durante el build. Cambios requieren redeploy.

---

## Herramientas de verificación

| Herramienta | Qué verifica |
|---|---|
| [search.google.com/test/rich-results](https://search.google.com/test/rich-results) | Schema JSON-LD (GeneralContractor, Service, FAQPage) |
| [opengraph.xyz](https://www.opengraph.xyz) | OG Images + Twitter cards |
| [search.google.com/search-console](https://search.google.com/search-console) | Indexación, sitemap, cobertura |
| `Ctrl+U` en `/sitemap.xml` | Hreflang en XML |
| `https://grucore.com/robots.txt` | Reglas de crawling |
| `https://grucore.com/llms.txt` | Contenido para LLMs |
