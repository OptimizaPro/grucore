# Grucore — Plan Estratégico SEO & GEO

> Generado: 2026-10-23 · Pre-lanzamiento · Mercado: Guatemala
> Documento completo (editable): https://claude.ai/artifact/ByC5g4Y1oZaTyKNwhQ9nKF
> Clusters de keywords detallados: `docs/seo-keyword-clusters.md`

---

## 1. Keyword Research

### Tier 1 — Keywords primarias (mayor volumen, mayor competencia)

| Keyword | Intención | Página objetivo |
|---|---|---|
| empresa constructora Guatemala | Comercial | Pillar `/empresa-constructora-guatemala` |
| constructora Guatemala | Comercial | Pillar |
| remodelación Guatemala | Comercial | Spoke 2A `/remodelacion-de-interiores-guatemala` |
| construcción de casas Guatemala | Comercial/T | Spoke 1A |
| remodelación de interiores Guatemala | Comercial | Spoke 2A |

### Tier 2 — Keywords secundarias

| Keyword | Intención | Página objetivo |
|---|---|---|
| construcción comercial Guatemala | Comercial | Página servicios comerciales |
| contratista general Guatemala | Comercial | Spoke 4C |
| empresa remodelación casas Guatemala | Comercial | Spoke 2A |
| gestión proyectos construcción | Comercial | Spoke 4A |
| gestión proyectos construcción Guatemala | Comercial | Spoke 3A |

### Tier 3 — Long-tail de alta conversión

| Keyword | Intención | Página objetivo |
|---|---|---|
| cuánto cuesta construir una casa en Guatemala | Informacional | Spoke 1B |
| precio m2 construcción Guatemala 2026 | Informacional | Spoke 1B |
| cotización construcción casa Guatemala | Transaccional | Spoke 1C |
| cuánto cuesta remodelar una casa Guatemala | Informacional | Spoke 2C |
| construcción llave en mano Guatemala | Comercial/T | Spoke 3C |

> Validar volúmenes reales con Google Keyword Planner tras lanzamiento.

---

## 2. Mapeo de intención de búsqueda

**Regla:** una intención = un tipo de página. Sin canibalización.

| Intención | Tipo de página | Ejemplos |
|---|---|---|
| **Informacional** | Blog / Guía | Costos de construcción, proceso, permisos |
| **Navegacional** | Home / Sobre nosotros | Búsquedas de marca |
| **Comercial** | Página de servicio | Construcción residencial, remodelación |
| **Transaccional** | Landing de cotización | Cotizar construcción, presupuesto remodelación |

---

## 3. Landscape de competidores

### Competidores directos identificados

| Dominio | Tipo | Brecha SEO |
|---|---|---|
| civiarq.com | Constructora generalista | Sin schema markup, contenido no premium |
| grupoadpi.gt | Constructora establecida | Sitio desactualizado, sin blog |
| emosa.gt | Remodelación | Blog con contenido delgado |
| area2.gt | Construcción comercial | Sin cobertura residencial |
| pmconstructiongt.com | PM/gestión | Página muy delgada |

### Brechas del sector (oportunidades para Grucore)

- **Cero contenido de blog** en la mayoría de constructoras guatemaltecas
- **Sin schema markup** — nadie en el sector lo implementa
- **Sin posicionamiento premium** — todo es genérico
- **Sin GEO optimization** — invisible en AI Overviews y ChatGPT
- **Gestión de proyectos sin posicionamiento premium** — categoría con competencia débil

---

## 4. Arquitectura del sitio (Next.js 15 App Router)

### URL tree completo

```
grucore.com/
├── /                                              # Home
├── /empresa-constructora-guatemala                # PILLAR — brand authority
├── /servicios/
│   ├── /construccion-de-casas-guatemala           # Spoke 1A
│   ├── /remodelacion-de-interiores-guatemala      # Spoke 2A
│   └── /gestion-proyectos-construccion-guatemala  # Spoke 3A
├── /precios/
│   ├── /costo-construir-casa-guatemala            # Spoke 1B
│   └── /costo-remodelacion-casa-guatemala         # Spoke 2C
├── /cotizar/                                      # CTA transaccional
├── /proyectos/                                    # Portafolio
├── /blog/                                         # Contenido informacional
│   ├── /proceso-construir-casa-guatemala          # Spoke 1D
│   ├── /remodelacion-cocina-bano-guatemala        # Spoke 2B
│   └── /supervision-de-obra-guatemala             # Spoke 3B
├── /sobre-nosotros/
└── /contacto/
```

### Convenciones URL (Next.js App Router)

- Sin tildes ni caracteres especiales: `remodelacion` no `remodelación`
- Separador: guión (`-`), nunca guión bajo
- Sin stop words innecesarias (de, en, la, el) excepto cuando son parte del keyword
- Máximo 3 niveles de profundidad
- Canonical tag en toda página con query params

### Configuraciones Next.js requeridas

```typescript
// app/layout.tsx — metadata global
export const metadata: Metadata = {
  metadataBase: new URL('https://grucore.com'),
  alternates: { canonical: '/' },
  openGraph: { type: 'website', locale: 'es_GT' },
}

// app/sitemap.ts — generación dinámica
// app/robots.ts — reglas de crawl
// generateMetadata() — metadata por página
```

---

## 5. Estrategia de contenido

### Tier 1 — Páginas obligatorias en lanzamiento (Día 0)

| Página | URL | Tipo | Keywords |
|---|---|---|---|
| Home | `/` | Brand + conversión | Grucore + ciudad |
| Pillar | `/empresa-constructora-guatemala` | Autoridad de marca | empresa constructora Guatemala |
| Construcción residencial | `/servicios/construccion-de-casas-guatemala` | Servicio | construcción de casas Guatemala |
| Remodelación | `/servicios/remodelacion-de-interiores-guatemala` | Servicio | remodelación de interiores Guatemala |
| Cotizar | `/cotizar` | Conversión | cotización construcción Guatemala |

### Tier 2 — Primer mes post-lanzamiento

| Página | URL | Keywords |
|---|---|---|
| Costos construcción | `/precios/costo-construir-casa-guatemala` | cuánto cuesta construir una casa Guatemala |
| Gestión de proyectos | `/servicios/gestion-proyectos-construccion-guatemala` | gestión proyectos construcción |
| Remodelación cocina/baño | `/blog/remodelacion-cocina-bano-guatemala` | remodelación cocina baño Guatemala |
| Portafolio | `/proyectos` | constructora Guatemala obras |

### Tier 3 — Blog (meses 2-6)

| Artículo | URL | Keyword objetivo |
|---|---|---|
| Proceso para construir una casa | `/blog/proceso-construir-casa-guatemala` | proceso construir casa Guatemala |
| Cuánto cuesta remodelar | `/blog/costo-remodelacion-casa-guatemala` | cuánto cuesta remodelar Guatemala |
| Permisos de construcción | `/blog/permisos-construccion-guatemala` | permisos de construcción Guatemala |
| Cómo elegir constructora | `/blog/como-elegir-constructora-guatemala` | cómo elegir constructora Guatemala |
| Precio m2 construcción 2026 | `/blog/precio-construccion-m2-guatemala-2026` | precio construcción m2 Guatemala |

**Patrón obligatorio por artículo:**
- Schema FAQ o Article
- Autor con E-E-A-T (nombre, cargo, foto)
- CTA a página de servicio relevante
- 1,200–1,800 palabras mínimo
- Fecha de publicación y actualización visible

---

## 6. Local SEO — Guatemala City

### Google Business Profile (GBP)

- **Categoría primaria:** General Contractor
- **Categorías secundarias:** Construction Company, Remodeling Contractor, Home Builder
- **NAP canónico:**
  ```
  Grucore
  [Dirección completa, Zona X, Guatemala City, Guatemala]
  Tel: +502 XXXX-XXXX
  grucore.com
  ```
- Añadir este NAP exacto en footer de cada página

### Directorios de citas prioritarios (Guatemala)

1. Google Business Profile ← más importante
2. Facebook Business
3. Páginas Amarillas Guatemala (paginasamarillas.com.gt)
4. Empresa.gt
5. Kompass Guatemala
6. LinkedIn Company Page
7. Construred Guatemala
8. Archdaily Guatemala (si aplica portafolio)

### Schema JSON-LD para `layout.tsx`

```json
{
  "@context": "https://schema.org",
  "@type": ["GeneralContractor", "LocalBusiness"],
  "name": "Grucore",
  "description": "Empresa constructora y remodeladora premium en Guatemala",
  "url": "https://grucore.com",
  "telephone": "+502-XXXX-XXXX",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[Dirección]",
    "addressLocality": "Guatemala City",
    "addressRegion": "Guatemala",
    "addressCountry": "GT"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 14.6349,
    "longitude": -90.5069
  },
  "areaServed": {
    "@type": "Country",
    "name": "Guatemala"
  },
  "priceRange": "$$$$",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      "opens": "08:00",
      "closes": "18:00"
    }
  ]
}
```

---

## 7. GEO — Optimización para AI Search (Google AI Overviews, ChatGPT, Perplexity)

### 5 señales clave a implementar

**1. Consistencia de entidad**
- Nombre exacto "Grucore" consistente en todas las páginas, GBP, redes y directorios
- Añadir `sameAs` en schema apuntando a perfiles sociales verificados

**2. Formato de respuesta directa**
- Primeros 150 palabras de cada página = respuesta directa a la query principal
- Usar H2/H3 con las preguntas PAA exactas
- Listas y tablas para datos que los LLMs pueden citar fácilmente

**3. E-E-A-T**
- Página "Sobre nosotros" con historial real de la empresa, años de experiencia, proyectos completados
- Bio del equipo con fotos y credenciales
- Casos de estudio con números concretos (m², presupuesto, tiempo de entrega)

**4. Schema matrix completa**

| Página | Schema types |
|---|---|
| Home / Pillar | `LocalBusiness` + `GeneralContractor` + `WebSite` |
| Páginas de servicio | `Service` + `Offer` |
| Blog / Guías | `Article` + `BreadcrumbList` |
| Blog con preguntas | `FAQPage` (para citabilidad LLM, no para rich results Google) |
| Portafolio | `CreativeWork` o `Project` |
| Cotizar | `ContactPage` |
| Reviews/Testimonios | `Review` + `AggregateRating` |

**5. Contenido conversacional para Knowledge Panel**
- Añadir párrafo "Acerca de Grucore" en Home y About que responda: quiénes somos, qué hacemos, dónde, desde cuándo, qué nos diferencia
- Usar lenguaje natural que los LLMs puedan re-citar como definición de la entidad

### llms.txt (recomendado)

Crear `/public/llms.txt`:
```
# Grucore

Grucore es una empresa de construcción y remodelación premium en Guatemala City, Guatemala.
Servicios: construcción residencial, remodelación de interiores, gestión de proyectos de construcción.
Sitio web: https://grucore.com
Contacto: [email]
```

---

## 8. Plan de acción — 12 meses

### Fase 1 — Fundación (Mes 0–1)

| Tarea | Prioridad |
|---|---|
| Registrar dominio + configurar Railway/Vercel | Crítica |
| Crear GBP y verificar | Crítica |
| Publicar Tier 1 (6 páginas de lanzamiento) | Crítica |
| Implementar schema JSON-LD global | Alta |
| Configurar `sitemap.ts` y `robots.ts` | Alta |
| Crear `/llms.txt` | Media |
| Submit a Google Search Console | Alta |
| Crear perfiles en 3 directorios top | Media |

### Fase 2 — Autoridad (Mes 2–3)

| Tarea | Prioridad |
|---|---|
| Publicar Tier 2 (4 páginas) | Alta |
| Primer artículo de blog (quick win: costos m2) | Alta |
| Optimizar GBP: fotos, posts semanales, responder reviews | Alta |
| Completar citas en 8 directorios | Media |
| Añadir casos de estudio al portafolio | Alta |
| Implementar `AggregateRating` si hay reviews | Media |

### Fase 3 — Contenido (Mes 4–6)

| Tarea | Prioridad |
|---|---|
| Publicar 4 artículos de blog restantes | Alta |
| Spokes de precio (1B, 2C, 3C) | Alta |
| Link building: menciones en medios construcción GT | Media |
| Actualizar artículos con fecha 2026 visible | Media |

### Fase 4 — Escala (Mes 7–12)

| Tarea | Prioridad |
|---|---|
| Completar Tier 3 (7 spokes restantes) | Media |
| Estrategia de reviews (mínimo 10 en GBP) | Alta |
| Análisis de drift SEO trimestral | Media |
| Integrar GA4 + GSC para tracking de keywords | Alta |
| Evaluar hreflang si se añade inglés | Baja |

### KPIs por mes

| Mes | Páginas indexadas | Posiciones top 10 | Leads orgánicos |
|---|---|---|---|
| 1 | 6–10 | 0–2 | 0 |
| 3 | 15–20 | 5–10 | 2–5/mes |
| 6 | 25–30 | 15–25 | 10–20/mes |
| 12 | 35+ | 30–40 | 30–50/mes |

---

## Resumen ejecutivo

**Mayor oportunidad:** Gestión de proyectos y construcción llave en mano — competencia débil con páginas delgadas y sin posicionamiento premium.

**Quick wins (rankings en 60–90 días):**
1. `construcción llave en mano Guatemala`
2. `supervisión de obra Guatemala`
3. `gestión de proyectos construcción Guatemala`
4. `cotización remodelación Guatemala`
5. `proceso para construir una casa en Guatemala`

**Diferenciador SEO vs competencia:** schema markup + blog con E-E-A-T + posicionamiento premium. Ningún competidor tiene los tres.

**Referencia clusters detallados:** `docs/seo-keyword-clusters.md`
