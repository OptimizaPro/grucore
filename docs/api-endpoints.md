# Grucore ERP — API Endpoints

> Base URL: `http://localhost:8000/api/` (dev) · `https://api.tudominio.com/api/` (prod)
> Auth: Bearer JWT — obtener token en `POST /api/auth/token/`
> Documentación interactiva: `GET /api/docs/` (Swagger) · `GET /api/redoc/` (ReDoc)
> Schema OpenAPI 3.0: `GET /api/schema/`

---

## Autenticación

| Método | Endpoint                   | Auth | Descripción                           |
|--------|----------------------------|------|---------------------------------------|
| POST   | `/api/auth/token/`         | No   | Login — devuelve `access` + `refresh` |
| POST   | `/api/auth/token/refresh/` | No   | Renueva el access token               |
| POST   | `/api/auth/token/verify/`  | No   | Verifica si un token es válido        |

---

## Proyectos — `/api/projects/`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/projects/` | Sí | Listado de proyectos |
| POST | `/api/projects/` | Sí | Crear proyecto |
| GET | `/api/projects/{id}/` | Sí | Detalle de proyecto |
| PUT/PATCH | `/api/projects/{id}/` | Sí | Actualizar proyecto |
| DELETE | `/api/projects/{id}/` | Sí | Eliminar proyecto |
| GET | `/api/projects/{id}/phases/` | Sí | Fases del proyecto |
| GET | `/api/projects/{id}/tasks/` | Sí | Tareas del proyecto |
| GET | `/api/projects/{id}/milestones/` | Sí | Hitos de pago |
| GET | `/api/projects/{id}/progress/` | Sí | Actualizaciones de avance |
| GET | `/api/projects/clients/` | Sí | Listado de clientes |
| POST | `/api/projects/clients/` | Sí | Crear cliente |
| GET | `/api/projects/clients/{id}/` | Sí | Detalle de cliente |

---

## Cotizaciones — `/api/projects/quotes/`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/projects/quotes/` | Sí | Listado de cotizaciones |
| POST | `/api/projects/quotes/` | Sí | Crear cotización |
| GET | `/api/projects/quotes/{id}/` | Sí | Detalle de cotización |
| PUT/PATCH | `/api/projects/quotes/{id}/` | Sí | Actualizar cotización |

---

## Documentos — `/api/projects/documents/`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/projects/documents/` | Sí | Listado de documentos |
| POST | `/api/projects/documents/` | Sí | Subir documento |
| GET | `/api/projects/rfis/` | Sí | Listado de RFIs |
| POST | `/api/projects/rfis/` | Sí | Crear RFI |
| GET | `/api/projects/submittals/` | Sí | Listado de submittals |
| GET | `/api/projects/punchitems/` | Sí | Punch items |

---

## Órdenes de cambio — `/api/projects/change-orders/`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/projects/change-orders/` | Sí | Listado de órdenes de cambio |
| POST | `/api/projects/change-orders/` | Sí | Crear orden de cambio |
| GET | `/api/projects/change-orders/{id}/` | Sí | Detalle |
| PUT/PATCH | `/api/projects/change-orders/{id}/` | Sí | Actualizar |

---

## Finanzas — `/api/projects/financials/`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/projects/expenses/` | Sí | Listado de gastos |
| POST | `/api/projects/expenses/` | Sí | Registrar gasto |
| GET | `/api/projects/invoices/` | Sí | Listado de facturas |
| POST | `/api/projects/invoices/` | Sí | Crear factura |

---

## Comunicaciones

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/notifications/` | Sí | Notificaciones del usuario |
| PATCH | `/api/notifications/{id}/` | Sí | Marcar como leída |
| GET | `/api/projects/messages/` | Sí | Mensajes de proyecto |
| POST | `/api/projects/messages/` | Sí | Enviar mensaje |

---

## Inventario — `/api/inventory/`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/inventory/products/` | Sí | Catálogo de productos |
| POST | `/api/inventory/products/` | Sí | Crear producto |
| GET | `/api/inventory/products/{id}/` | Sí | Detalle de producto |
| PUT/PATCH | `/api/inventory/products/{id}/` | Sí | Actualizar producto |
| GET | `/api/inventory/categories/` | Sí | Categorías de inventario |
| GET | `/api/inventory/movements/` | Sí | Movimientos de stock |
| POST | `/api/inventory/movements/` | Sí | Registrar movimiento |

---

## CRM — `/api/crm/`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/crm/leads/` | Sí | Listado de leads |
| POST | `/api/crm/leads/` | Sí* | Crear lead — candidato a público para formulario web |
| GET | `/api/crm/leads/{id}/` | Sí | Detalle de lead |
| PUT/PATCH | `/api/crm/leads/{id}/` | Sí | Actualizar lead |
| POST | `/api/crm/leads/{id}/move/` | Sí | Mover lead de etapa |
| POST | `/api/crm/leads/{id}/convert/` | Sí | Convertir lead en cliente |
| GET | `/api/crm/leads/{id}/activities/` | Sí | Actividades del lead |
| POST | `/api/crm/leads/{id}/activities/` | Sí | Registrar actividad |
| GET | `/api/crm/pipelines/` | Sí | Listado de pipelines |
| POST | `/api/crm/pipelines/` | Sí | Crear pipeline |
| GET/PUT | `/api/crm/pipelines/{id}/` | Sí | Detalle / actualizar pipeline |
| GET | `/api/crm/pipelines/{id}/stages/` | Sí | Etapas del pipeline |
| POST | `/api/crm/pipelines/{id}/stages/reorder/` | Sí | Reordenar etapas |

> `*` Pendiente: abrir `POST /api/crm/leads/` sin autenticación para formularios del sitio modular.

---

## Trabajadores — `/api/workers/`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/workers/` | Sí | Listado de trabajadores |
| POST | `/api/workers/` | Sí | Registrar trabajador |
| GET | `/api/workers/{id}/` | Sí | Detalle de trabajador |
| GET | `/api/workers/worklogs/` | Sí | Registros de jornada |
| POST | `/api/workers/worklogs/` | Sí | Registrar jornada |

---

## Proveedores — `/api/suppliers/`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/suppliers/` | Sí | Listado de proveedores |
| POST | `/api/suppliers/` | Sí | Crear proveedor |
| GET | `/api/suppliers/{id}/` | Sí | Detalle de proveedor |
| PUT/PATCH | `/api/suppliers/{id}/` | Sí | Actualizar proveedor |

---

## CMS — `/api/cms/`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/cms/pages/` | No* | Listado de páginas públicas |
| GET | `/api/cms/pages/{slug}/` | No* | Página por slug |
| GET | `/api/cms/sections/` | No* | Secciones de página |
| GET | `/api/cms/blocks/` | No* | Bloques de contenido |

> `*` Pendiente verificar que los endpoints CMS están configurados como públicos (`AllowAny`).

---

## Usuarios — `/api/users/`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/users/me/` | Sí | Perfil del usuario autenticado |
| PUT/PATCH | `/api/users/me/` | Sí | Actualizar perfil |

---

## Core — `/api/`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/health/` | No | Health check (usado por Docker) |
| GET | `/api/company/` | No* | Configuración pública de empresa (nombre, logo) |

---

## Documentación interactiva

| URL                | Descripción                                      |
|--------------------|--------------------------------------------------|
| `GET /api/docs/`   | Swagger UI — interactivo, con Authorize para JWT |
| `GET /api/redoc/`  | ReDoc — lectura limpia, ideal para compartir     |
| `GET /api/schema/` | Schema OpenAPI 3.0 en YAML                       |

Para generar types TypeScript automáticamente desde el schema:
```bash
npx openapi-typescript http://localhost:8000/api/schema/ -o src/lib/api.types.ts
```

---

## Pendientes para el frontend modular

| Endpoint | Acción requerida |
|---|---|
| `POST /api/crm/leads/` | Abrir sin autenticación + rate limiting |
| `GET /api/cms/pages/` | Verificar permisos públicos |
| `GET /api/inventory/products/` | Verificar permisos públicos + filtro por categoría |
| `GET /api/projects/?portfolio=true` | Verificar filtro `is_public_portfolio` |
| CORS | Añadir dominio del sitio modular a `CORS_ALLOWED_ORIGINS` |
