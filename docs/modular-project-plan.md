# Plan — Proyecto Construcción Modular

> Frontend Next.js independiente que consume la API de Grucore ERP.
> Creado: 2026-10-23

---

## Decisiones de arquitectura

| Aspecto | Decisión |
|---|---|
| Frontend | Next.js 15 (App Router) — repo independiente |
| Backend | Grucore ERP API (DRF) — sin duplicar lógica |
| Deploy frontend | Railway |
| Deploy backend | Railway (ya existente, mismo servicio) |
| Dominio | Independiente del ERP |
| Auth | Pública para cotizaciones / NextAuth para área de cliente |
| Styling | Tailwind CSS + shadcn/ui (mismo stack que Grucore frontend) |

---

## Fase 1 — Auditoría de la API existente

Antes de escribir una línea del nuevo frontend, verificar qué endpoints de Grucore ya sirven para este proyecto y qué falta.

- [ ] **CRM / Leads** — `POST /api/crm/leads/` existe y está accesible sin autenticación (formulario de contacto del sitio modular enviará leads aquí)
- [ ] **CMS** — `GET /api/cms/pages/`, `GET /api/cms/sections/`, `GET /api/cms/blocks/` — ¿exponen contenido público?
- [ ] **Inventario / Catálogo** — `GET /api/inventory/products/` — ¿tiene filtros por categoría? ¿está públicamente accesible?
- [ ] **Proyectos / Portafolio** — `GET /api/projects/` — campo `is_public_portfolio=True` existe en el modelo; ¿el endpoint respeta ese filtro?
- [ ] **Cotizaciones** — ¿existe endpoint público para solicitar una cotización sin autenticación?
- [ ] **CORS** — añadir el dominio del nuevo frontend a `CORS_ALLOWED_ORIGINS` en `development.py` y `production.py`

### Endpoints que probablemente hay que crear en Grucore

| Endpoint | Propósito | Prioridad |
|---|---|---|
| `POST /api/crm/leads/` (público, sin auth) | Formulario de contacto / solicitud de cotización | Alta |
| `GET /api/cms/pages/?slug=<slug>` (público) | Servir contenido de páginas desde CMS | Media |
| `GET /api/projects/?portfolio=true` (público) | Portafolio de obras terminadas | Media |
| `GET /api/inventory/products/?category=modular` (público) | Catálogo de módulos | Media |
| `POST /api/quotes/request/` (público) | Solicitar presupuesto sin cuenta | Baja (Fase 2) |

---

## Fase 2 — Crear el repo del nuevo frontend

### 2.1 Scaffold inicial

```bash
npx create-next-app@latest modular-web --typescript --tailwind --app --src-dir
cd modular-web
npx shadcn@latest init
```

### 2.2 Estructura de carpetas

```
modular-web/
├── src/
│   ├── app/
│   │   ├── (marketing)/          # Páginas públicas
│   │   │   ├── page.tsx          # Home / Hero
│   │   │   ├── catalogo/         # Catálogo de módulos
│   │   │   ├── proyectos/        # Portafolio de obras
│   │   │   ├── como-funciona/    # Proceso constructivo
│   │   │   ├── contacto/         # Formulario → lead en Grucore CRM
│   │   │   └── cotizar/          # Solicitud de cotización
│   │   └── (cliente)/            # Área privada (Fase 3)
│   │       └── dashboard/        # Seguimiento del proyecto del cliente
│   ├── components/
│   │   ├── ui/                   # shadcn components
│   │   ├── layout/               # Header, Footer, Nav
│   │   ├── sections/             # Hero, Features, Process, CTA, etc.
│   │   └── modular/              # Configurador, ModuleCard, PriceCalculator
│   ├── lib/
│   │   ├── api.ts                # Cliente HTTP apuntando a Grucore API
│   │   └── types.ts              # Types espejo de los serializers de Grucore
│   └── hooks/
│       └── useLeadForm.ts        # Hook para enviar leads al CRM
├── public/
├── .env.local
├── CLAUDE.md
└── AGENTS.md
```

### 2.3 Variables de entorno (`.env.local`)

```env
NEXT_PUBLIC_API_URL=https://api.tudominio.com   # Grucore ERP en Railway
NEXT_PUBLIC_SITE_NAME=Nombre del servicio modular
NEXT_PUBLIC_BRAND_COLOR=#HEXCOLOR
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3001
```

---

## Fase 3 — Páginas y componentes core

### Prioridad alta (MVP)

- [ ] **Hero** — propuesta de valor, CTA a catálogo y cotización
- [ ] **Cómo funciona** — 4–5 pasos del proceso modular (diseño → fabricación → instalación → entrega)
- [ ] **Catálogo de módulos** — grid de cards con tipo, m², precio base, materiales (acero / madera)
- [ ] **Formulario de contacto / cotización** — `POST /api/crm/leads/` → aparece en Grucore CRM automáticamente
- [ ] **Footer** — datos de contacto, redes, legal

### Prioridad media

- [ ] **Portafolio** — proyectos terminados con `is_public_portfolio=True` desde Grucore API
- [ ] **Calculadora de precio** — estimado inmediato según m², tipo de estructura y acabados
- [ ] **Hero con time-lapse** — BuildSequenceHero (valorado, pendiente de vídeo)

### Prioridad baja (Fase 3)

- [ ] **Área de cliente** — login con NextAuth, ver estado del proyecto, aprobar hitos, descargar documentos
- [ ] **Configurador 3D** — selección visual de módulos y combinaciones

---

## Fase 4 — Integración Grucore CRM

El formulario de cotización/contacto del sitio modular crea un lead directamente en Grucore:

```typescript
// src/hooks/useLeadForm.ts
const submitLead = async (data: LeadFormData) => {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/crm/leads/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      phone: data.phone,
      source: 'web_modular',
      notes: data.message,
      pipeline: MODULAR_PIPELINE_ID,  // ID del pipeline "Modular" en Grucore
    }),
  })
}
```

Requiere:
- [ ] Endpoint `POST /api/crm/leads/` abierto sin autenticación (o con API key pública)
- [ ] Pipeline "Construcción Modular" creado en Grucore CRM
- [ ] CORS actualizado con el dominio del nuevo sitio

---

## Fase 5 — Deploy

### Frontend (Railway)
- [ ] Crear repo en GitHub
- [ ] Conectar a Railway
- [ ] Configurar env vars: `NEXT_PUBLIC_API_URL` apuntando al servicio backend Railway
- [ ] Configurar dominio personalizado

### Backend (Railway — sin cambios de infra)
- [ ] Añadir nuevo dominio del frontend a `CORS_ALLOWED_ORIGINS` en settings de producción
- [ ] Verificar que los endpoints públicos no requieren autenticación JWT
- [ ] Añadir rate limiting en endpoints públicos (formulario de contacto)

---

## Checklist de arranque

Antes de escribir el primer componente:

- [ ] Fase 1 completada — API auditada, endpoints públicos verificados
- [ ] CORS actualizado en Grucore para `localhost:3001` (dev) y dominio producción
- [ ] Pipeline "Construcción Modular" creado en Grucore CRM via admin
- [ ] Nombre del servicio, dominio y color de marca definidos
- [ ] Repo creado en GitHub
- [ ] Vídeo time-lapse disponible (para BuildSequenceHero — opcional en MVP)

---

## Pendiente definir

- [ ] Nombre comercial del servicio modular
- [ ] Dominio
- [ ] Color de marca
- [ ] ¿Mismo equipo/empresa que Grucore o marca independiente?
- [ ] Precio base público en el sitio (sí/no) o solo solicitud de cotización
