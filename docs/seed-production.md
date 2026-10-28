# Poblar base de datos de producción

Ejecutar desde el **Railway Shell** del servicio `backend`.
Railway dashboard → servicio `backend` → Deployments → deployment activo → **Open Shell**

## Primera vez (base de datos vacía)

```bash
# 1. Crea el superusuario de Django admin
python manage.py createsuperuser

# 2. Pobla todos los módulos con datos demo
python manage.py seed_all

# 3. Si seed_all falla a mitad, re-ejecuta solo la parte que faltó:
python manage.py seed_all --skip-deps   # omite pasos 1–4, continúa desde CRM
python manage.py seed_cms               # CMS por separado si --skip-deps tampoco lo incluyó
```

## Qué crea `seed_all`

| Paso | Comando interno | Datos |
|------|----------------|-------|
| 1 | `seed_ledger` | Catálogo de cuentas, centros y códigos de costo |
| 2 | `seed_mano_de_obra` | Productos de mano de obra en inventario |
| 3 | `create_demo_client` | Cliente, proyecto y hitos demo |
| 4 | `seed_demo_erp` | Workers, tareas, gastos, docs, RFIs, mensajes |
| 5 | `seed_cms` | Páginas y secciones CMS del sitio público |
| 6–20 | seed propio | Períodos contables, GL mappings, reglas fiscales, activos fijos, CRM pipeline + 12 leads, órdenes de compra, subcontratistas, CompanySettings |

## Re-poblar módulos individuales

```bash
python manage.py seed_ledger        # Catálogo contable
python manage.py seed_mano_de_obra  # Mano de obra
python manage.py seed_demo_erp      # Proyecto demo completo
python manage.py seed_cms           # CMS / contenido web
python manage.py seed_all --skip-deps  # Todo excepto pasos 1–4
```

## Acceso al admin

URL: `https://api.grucore.com/djamasy/`
Acceso desde el sitio: `https://grucore.com/djamasy/` (redirige al backend)
