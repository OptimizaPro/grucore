import csv
import io
from decimal import Decimal, InvalidOperation

from django.http import HttpResponse
from rest_framework import generics, permissions
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import InventoryCategory, Product, StockMovement, UnitType
from .serializers import InventoryCategorySerializer, ProductSerializer, StockMovementSerializer


# ─── Categorías de inventario ─────────────────────────────────────────────────

class InventoryCategoryListCreateView(generics.ListCreateAPIView):
    queryset           = InventoryCategory.objects.all()
    serializer_class   = InventoryCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [SearchFilter, OrderingFilter]
    search_fields      = ['name', 'description']
    ordering_fields    = ['name', 'created_at']
    ordering           = ['name']


class InventoryCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = InventoryCategory.objects.all()
    serializer_class   = InventoryCategorySerializer
    permission_classes = [permissions.IsAuthenticated]


# ─── Productos ────────────────────────────────────────────────────────────────

class ProductListCreateView(generics.ListCreateAPIView):
    serializer_class   = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['category', 'is_active', 'unit']
    search_fields      = ['name', 'sku', 'description', 'supplier_name']
    ordering_fields    = ['name', 'stock_quantity', 'unit_price_gtq', 'created_at']
    ordering           = ['name']

    def get_queryset(self):
        return Product.objects.select_related('category').all()


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = Product.objects.select_related('category').all()
    serializer_class   = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]


# ─── Movimientos de stock ─────────────────────────────────────────────────────

class StockMovementListCreateView(generics.ListCreateAPIView):
    serializer_class   = StockMovementSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['product', 'movement_type', 'project']
    search_fields      = ['notes', 'reference_number']
    ordering_fields    = ['created_at']
    ordering           = ['-created_at']

    def get_queryset(self):
        return StockMovement.objects.select_related('product', 'project', 'performed_by').all()

    def perform_create(self, serializer):
        serializer.save(performed_by=self.request.user)


class StockMovementDetailView(generics.RetrieveAPIView):
    queryset           = StockMovement.objects.select_related('product', 'project', 'performed_by').all()
    serializer_class   = StockMovementSerializer
    permission_classes = [permissions.IsAuthenticated]


# ─── Import / Export helpers ──────────────────────────────────────────────────

# Internal field names (used in validation logic)
IMPORT_HEADERS = [
    'name', 'sku', 'description', 'category',
    'unit', 'unit_price_gtq', 'stock_quantity',
    'min_stock_alert', 'supplier_name', 'supplier_contact',
]

# Spanish column labels shown in the downloadable template
TEMPLATE_HEADERS_ES = [
    'nombre', 'sku', 'descripcion', 'categoria',
    'unidad', 'precio_unitario_gtq', 'stock', 'stock_minimo',
    'proveedor', 'contacto_proveedor',
]

# Map Spanish header → internal field name (covers both ES and EN uploads)
_HEADER_MAP: dict[str, str] = {
    'nombre': 'name', 'name': 'name',
    'sku': 'sku',
    'descripcion': 'description', 'descripción': 'description', 'description': 'description',
    'categoria': 'category', 'categoría': 'category', 'category': 'category',
    'unidad': 'unit', 'unit': 'unit',
    'precio_unitario_gtq': 'unit_price_gtq', 'unit_price_gtq': 'unit_price_gtq', 'precio': 'unit_price_gtq',
    'stock': 'stock_quantity', 'stock_quantity': 'stock_quantity', 'cantidad_stock': 'stock_quantity',
    'stock_minimo': 'min_stock_alert', 'stock_mínimo': 'min_stock_alert', 'min_stock_alert': 'min_stock_alert',
    'proveedor': 'supplier_name', 'supplier_name': 'supplier_name',
    'contacto_proveedor': 'supplier_contact', 'supplier_contact': 'supplier_contact', 'contacto': 'supplier_contact',
}

# Accept both codes ('unit', 'kg') and Spanish display names ('unidad', 'kilogramo')
_UNIT_MAP: dict[str, str] = {code.lower(): code for code, _ in UnitType.choices}
_UNIT_MAP.update({
    'unidad': 'unit',
    'metro cuadrado': 'm2', 'm²': 'm2',
    'metro cúbico': 'm3', 'm³': 'm3',
    'metro lineal': 'ml',
    'kilogramo': 'kg',
    'libra': 'lb',
    'tonelada': 'ton',
    'litro': 'l',
    'saco': 'bag',
    'rollo': 'roll',
    'caja': 'box',
    'galón': 'gal', 'galon': 'gal',
})


def _parse_decimal(val: object, default: str = '0') -> Decimal | None:
    s = str(val).strip().replace(',', '.') if val is not None else ''
    if not s:
        return Decimal(default)
    try:
        return Decimal(s)
    except InvalidOperation:
        return None


def _normalize_row(raw: dict) -> dict:
    """Remap Spanish/English column names to internal field names."""
    return {
        _HEADER_MAP.get(k.strip().lower(), k.strip().lower()): v
        for k, v in raw.items()
    }


def _parse_file(file_obj, filename: str) -> list[dict]:
    """Parse CSV or XLSX into a list of dicts keyed by internal field names."""
    ext = filename.rsplit('.', 1)[-1].lower()

    if ext == 'csv':
        raw = file_obj.read()
        try:
            text = raw.decode('utf-8-sig')
        except UnicodeDecodeError:
            text = raw.decode('latin-1')
        reader = csv.DictReader(io.StringIO(text))
        return [_normalize_row({k.strip().lower(): (v or '').strip() for k, v in row.items()}) for row in reader]

    if ext in ('xlsx', 'xls'):
        import openpyxl
        wb = openpyxl.load_workbook(file_obj, data_only=True, read_only=True)
        ws = wb.active
        rows = list(ws.iter_rows(values_only=True))
        if not rows:
            return []
        headers = [str(c).strip().lower() if c is not None else '' for c in rows[0]]
        result = []
        for row in rows[1:]:
            if all(v is None for v in row):
                continue
            result.append(_normalize_row({
                headers[i]: (str(v).strip() if v is not None else '')
                for i, v in enumerate(row)
                if i < len(headers)
            }))
        wb.close()
        return result

    raise ValueError(f'Formato no soportado: .{ext}')


def _validate_rows(raw_rows: list[dict]) -> list[dict]:
    """Validate rows and return preview dicts (no DB writes)."""
    categories = {c.name.lower(): c for c in InventoryCategory.objects.all()}
    existing_skus = {
        p.sku.lower(): p
        for p in Product.objects.exclude(sku='').exclude(sku__isnull=True)
    }

    preview = []
    for i, raw in enumerate(raw_rows, start=2):  # row 1 = header
        errors: list[str] = []

        name = raw.get('name', '').strip()
        if not name:
            errors.append('El campo "name" es requerido')

        sku = raw.get('sku', '').strip() or None

        unit_raw = raw.get('unit', '').strip().lower()
        unit = _UNIT_MAP.get(unit_raw) if unit_raw else 'unit'
        if unit_raw and unit is None:
            errors.append(f'Unidad no reconocida: "{raw.get("unit")}"')
            unit = 'unit'

        price = _parse_decimal(raw.get('unit_price_gtq'))
        if price is None:
            errors.append(f'Precio inválido: "{raw.get("unit_price_gtq")}"')
            price = Decimal('0')

        stock = _parse_decimal(raw.get('stock_quantity'))
        if stock is None:
            errors.append(f'Stock inválido: "{raw.get("stock_quantity")}"')
            stock = Decimal('0')

        min_stock = _parse_decimal(raw.get('min_stock_alert'))
        if min_stock is None:
            errors.append(f'Alerta mínima inválida: "{raw.get("min_stock_alert")}"')
            min_stock = Decimal('0')

        cat_name = raw.get('category', '').strip()
        cat_new  = bool(cat_name and cat_name.lower() not in categories)

        existing = existing_skus.get(sku.lower()) if sku else None
        action   = 'update' if existing else 'create'

        preview.append({
            'row':              i,
            'action':           action,
            'errors':           errors,
            'valid':            not errors,
            'name':             name,
            'sku':              sku,
            'description':      raw.get('description', '').strip(),
            'category':         cat_name,
            'category_new':     cat_new,
            'unit':             unit or 'unit',
            'unit_price_gtq':   str(price),
            'stock_quantity':   str(stock),
            'min_stock_alert':  str(min_stock),
            'supplier_name':    raw.get('supplier_name', '').strip(),
            'supplier_contact': raw.get('supplier_contact', '').strip(),
        })

    return preview


# ─── Import views ─────────────────────────────────────────────────────────────

class ProductImportTemplateView(APIView):
    """GET — download a CSV template with headers and two example rows."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        resp = HttpResponse(content_type='text/csv; charset=utf-8')
        resp['Content-Disposition'] = 'attachment; filename="inventario_template.csv"'
        resp.write('\ufeff')  # BOM so Excel opens UTF-8 correctly
        writer = csv.writer(resp)
        writer.writerow(TEMPLATE_HEADERS_ES)
        writer.writerow(['Cemento UGC 42.5', 'CEM-001', 'Saco 42.5 kg', 'Materiales', 'bag',  '62.00', '50',  '10', 'Cementos Progreso', ''])
        writer.writerow(['Varilla 3/8"',      'VAR-375', '',              'Materiales', 'unit', '45.50', '200', '20', '',                  ''])
        return resp


class ProductImportPreviewView(APIView):
    """POST file → parse + validate → return rows preview (no DB writes)."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No se recibió ningún archivo.'}, status=400)

        name = file.name.lower()
        if not (name.endswith('.csv') or name.endswith('.xlsx') or name.endswith('.xls')):
            return Response({'error': 'Solo se aceptan archivos .csv, .xlsx o .xls.'}, status=400)

        try:
            raw_rows = _parse_file(file, name)
        except Exception as exc:
            return Response({'error': f'Error al leer el archivo: {exc}'}, status=400)

        if not raw_rows:
            return Response({'error': 'El archivo no contiene filas de datos.'}, status=400)
        if len(raw_rows) > 2000:
            return Response({'error': 'El archivo excede el límite de 2 000 filas.'}, status=400)

        rows    = _validate_rows(raw_rows)
        valid   = sum(1 for r in rows if r['valid'])
        invalid = len(rows) - valid

        return Response({'total': len(rows), 'valid': valid, 'invalid': invalid, 'rows': rows})


class ProductImportConfirmView(APIView):
    """POST { rows: [...] } → create/update products in DB."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        rows = [r for r in request.data.get('rows', []) if r.get('valid')]
        if not rows:
            return Response({'error': 'No hay filas válidas para importar.'}, status=400)

        cat_cache = {c.name.lower(): c for c in InventoryCategory.objects.all()}
        created = updated = skipped = 0
        errors: list[dict] = []

        for row in rows:
            try:
                # Get or create category
                category = None
                cat_name = (row.get('category') or '').strip()
                if cat_name:
                    cat = cat_cache.get(cat_name.lower())
                    if not cat:
                        cat = InventoryCategory.objects.create(name=cat_name)
                        cat_cache[cat_name.lower()] = cat
                    category = cat

                defaults = {
                    'name':             row['name'],
                    'description':      row.get('description', ''),
                    'category':         category,
                    'unit':             row.get('unit', 'unit'),
                    'unit_price_gtq':   Decimal(str(row.get('unit_price_gtq', '0'))),
                    'stock_quantity':   Decimal(str(row.get('stock_quantity', '0'))),
                    'min_stock_alert':  Decimal(str(row.get('min_stock_alert', '0'))),
                    'supplier_name':    row.get('supplier_name', ''),
                    'supplier_contact': row.get('supplier_contact', ''),
                    'is_active':        True,
                }

                sku = (row.get('sku') or '').strip() or None
                if sku:
                    _, was_created = Product.objects.update_or_create(sku=sku, defaults=defaults)
                    created += was_created
                    updated += not was_created
                else:
                    Product.objects.create(sku=None, **defaults)
                    created += 1

            except Exception as exc:
                skipped += 1
                errors.append({'row': row.get('row'), 'error': str(exc)})

        return Response({'created': created, 'updated': updated, 'skipped': skipped, 'errors': errors})


# ─── Bulk delete ──────────────────────────────────────────────────────────────

class ProductBulkDeleteView(APIView):
    """POST { ids: [1, 2, ...] } → delete products."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        ids = request.data.get('ids', [])
        if not ids:
            return Response({'error': 'No se proporcionaron IDs.'}, status=400)
        deleted, _ = Product.objects.filter(id__in=ids).delete()
        return Response({'deleted': deleted})
