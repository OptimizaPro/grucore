"""
Comando de seed: carga el catálogo de cuentas, centros de costo y códigos de costo base.

Uso:
    python manage.py seed_ledger
    python manage.py seed_ledger --reset   # elimina y recrea (solo dev)
"""
from django.core.management.base import BaseCommand
from apps.ledger.models import Account, AccountType, AccountNature, AccountLevel, PLGroup
from apps.core.models import CostCenter, CostCenterType, CostCode, CostCategory, CostBehavior


# ─── Catálogo de cuentas ─────────────────────────────────────────────────────
# Formato: (code, name, type, nature, level, pl_group, parent_code)
# parent_code=None → cuenta raíz de su clase

ACCOUNTS = [
    # ── Clase 1 Activos ───────────────────────────────────────────────────────
    ('1000', 'ACTIVOS',                                         'asset',     'debit',  'header',  '',               None),
    ('1100', 'Activo corriente',                                'asset',     'debit',  'header',  '',               '1000'),
    ('1110', 'Caja general',                                    'asset',     'debit',  'posting', 'balance_asset',  '1100'),
    ('1120', 'Caja chica',                                      'asset',     'debit',  'posting', 'balance_asset',  '1100'),
    ('1130', 'Bancos en quetzales',                             'asset',     'debit',  'posting', 'balance_asset',  '1100'),
    ('1131', 'Bancos en moneda extranjera',                     'asset',     'debit',  'posting', 'balance_asset',  '1100'),
    ('1140', 'Inversiones temporales',                          'asset',     'debit',  'posting', 'balance_asset',  '1100'),
    ('1200', 'Cuentas por cobrar comerciales',                  'asset',     'debit',  'header',  '',               '1100'),
    ('1201', 'Clientes nacionales',                             'asset',     'debit',  'posting', 'balance_asset',  '1200'),
    ('1202', 'Clientes del sector público',                     'asset',     'debit',  'posting', 'balance_asset',  '1200'),
    ('1203', 'Clientes relacionados',                           'asset',     'debit',  'posting', 'balance_asset',  '1200'),
    ('1210', 'Estimaciones por cobrar según contratos',         'asset',     'debit',  'posting', 'balance_asset',  '1200'),
    ('1220', 'Retenciones contractuales por cobrar',            'asset',     'debit',  'posting', 'balance_asset',  '1200'),
    ('1230', 'Otras cuentas por cobrar',                        'asset',     'debit',  'posting', 'balance_asset',  '1100'),
    ('1240', 'Estimación para cuentas incobrables',             'asset',     'credit', 'posting', 'balance_asset',  '1100'),
    ('1300', 'Impuestos y créditos fiscales',                   'asset',     'debit',  'header',  '',               '1100'),
    ('1301', 'IVA crédito fiscal',                              'asset',     'debit',  'posting', 'balance_asset',  '1300'),
    ('1302', 'ISR pagos a cuenta',                              'asset',     'debit',  'posting', 'balance_asset',  '1300'),
    ('1303', 'ISR retenido a favor',                            'asset',     'debit',  'posting', 'balance_asset',  '1300'),
    ('1304', 'Otros créditos fiscales recuperables',            'asset',     'debit',  'posting', 'balance_asset',  '1300'),
    ('1400', 'Inventarios',                                     'asset',     'debit',  'header',  '',               '1100'),
    ('1401', 'Cemento y agregados',                             'asset',     'debit',  'posting', 'balance_asset',  '1400'),
    ('1402', 'Acero y estructuras',                             'asset',     'debit',  'posting', 'balance_asset',  '1400'),
    ('1403', 'Mampostería y paneles',                           'asset',     'debit',  'posting', 'balance_asset',  '1400'),
    ('1404', 'Pisos, revestimientos y acabados',                'asset',     'debit',  'posting', 'balance_asset',  '1400'),
    ('1405', 'Materiales eléctricos',                           'asset',     'debit',  'posting', 'balance_asset',  '1400'),
    ('1406', 'Materiales de fontanería',                        'asset',     'debit',  'posting', 'balance_asset',  '1400'),
    ('1407', 'Pinturas e impermeabilizantes',                   'asset',     'debit',  'posting', 'balance_asset',  '1400'),
    ('1408', 'Carpintería, puertas y ventanas',                 'asset',     'debit',  'posting', 'balance_asset',  '1400'),
    ('1409', 'Herramientas y consumibles almacenados',          'asset',     'debit',  'posting', 'balance_asset',  '1400'),
    ('1410', 'Repuestos y suministros de maquinaria',           'asset',     'debit',  'posting', 'balance_asset',  '1400'),
    ('1411', 'Materiales en tránsito',                          'asset',     'debit',  'posting', 'balance_asset',  '1400'),
    ('1412', 'Inventario en poder de terceros',                 'asset',     'debit',  'posting', 'balance_asset',  '1400'),
    ('1413', 'Deterioro de inventarios',                        'asset',     'credit', 'posting', 'balance_asset',  '1400'),
    ('1500', 'Obras y contratos en curso',                      'asset',     'debit',  'header',  '',               '1100'),
    ('1501', 'Costes acumulados pendientes de asignación',      'asset',     'debit',  'posting', 'balance_asset',  '1500'),
    ('1502', 'Activos contractuales',                           'asset',     'debit',  'posting', 'balance_asset',  '1500'),
    ('1503', 'Otros activos relacionados con contratos',        'asset',     'debit',  'posting', 'balance_asset',  '1500'),
    ('1600', 'Pagos anticipados',                               'asset',     'debit',  'header',  '',               '1100'),
    ('1601', 'Seguros anticipados',                             'asset',     'debit',  'posting', 'balance_asset',  '1600'),
    ('1602', 'Alquileres anticipados',                          'asset',     'debit',  'posting', 'balance_asset',  '1600'),
    ('1603', 'Licencias y servicios anticipados',               'asset',     'debit',  'posting', 'balance_asset',  '1600'),
    ('1700', 'Activo no corriente',                             'asset',     'debit',  'header',  '',               '1000'),
    ('1710', 'Terrenos',                                        'asset',     'debit',  'posting', 'balance_asset',  '1700'),
    ('1720', 'Edificios e instalaciones propias',               'asset',     'debit',  'posting', 'balance_asset',  '1700'),
    ('1730', 'Maquinaria pesada',                               'asset',     'debit',  'header',  '',               '1700'),
    ('1731', 'Excavadoras y retroexcavadoras',                  'asset',     'debit',  'posting', 'balance_asset',  '1730'),
    ('1732', 'Cargadores y compactadoras',                      'asset',     'debit',  'posting', 'balance_asset',  '1730'),
    ('1733', 'Mezcladoras y equipos de concreto',               'asset',     'debit',  'posting', 'balance_asset',  '1730'),
    ('1734', 'Andamios y sistemas de trabajo',                  'asset',     'debit',  'posting', 'balance_asset',  '1730'),
    ('1740', 'Vehículos',                                       'asset',     'debit',  'posting', 'balance_asset',  '1700'),
    ('1750', 'Herramientas y equipos técnicos',                 'asset',     'debit',  'posting', 'balance_asset',  '1700'),
    ('1760', 'Mobiliario y equipo de oficina',                  'asset',     'debit',  'posting', 'balance_asset',  '1700'),
    ('1770', 'Equipos informáticos',                            'asset',     'debit',  'posting', 'balance_asset',  '1700'),
    ('1780', 'Software y otros intangibles capitalizables',     'asset',     'debit',  'posting', 'balance_asset',  '1700'),
    ('1790', 'Depreciación y amortización acumulada',           'asset',     'credit', 'header',  '',               '1700'),
    ('1791', 'Depreciación acumulada — edificios',              'asset',     'credit', 'posting', 'balance_asset',  '1790'),
    ('1792', 'Depreciación acumulada — maquinaria',             'asset',     'credit', 'posting', 'balance_asset',  '1790'),
    ('1793', 'Depreciación acumulada — vehículos',              'asset',     'credit', 'posting', 'balance_asset',  '1790'),
    ('1794', 'Depreciación acumulada — equipos',                'asset',     'credit', 'posting', 'balance_asset',  '1790'),
    ('1795', 'Amortización acumulada — intangibles',            'asset',     'credit', 'posting', 'balance_asset',  '1790'),

    # ── Clase 2 Pasivos ───────────────────────────────────────────────────────
    ('2000', 'PASIVOS',                                         'liability', 'credit', 'header',  '',                    None),
    ('2100', 'Proveedores',                                     'liability', 'credit', 'header',  '',                    '2000'),
    ('2101', 'Proveedores nacionales',                          'liability', 'credit', 'posting', 'balance_liability',   '2100'),
    ('2102', 'Proveedores extranjeros',                         'liability', 'credit', 'posting', 'balance_liability',   '2100'),
    ('2103', 'Proveedores de materiales',                       'liability', 'credit', 'posting', 'balance_liability',   '2100'),
    ('2104', 'Proveedores de maquinaria',                       'liability', 'credit', 'posting', 'balance_liability',   '2100'),
    ('2105', 'Proveedores de servicios',                        'liability', 'credit', 'posting', 'balance_liability',   '2100'),
    ('2110', 'Subcontratistas por pagar',                       'liability', 'credit', 'posting', 'balance_liability',   '2100'),
    ('2120', 'Facturas pendientes de recibir',                  'liability', 'credit', 'posting', 'balance_liability',   '2100'),
    ('2130', 'Retenciones a subcontratistas por pagar',         'liability', 'credit', 'posting', 'balance_liability',   '2100'),
    ('2200', 'Obligaciones laborales',                          'liability', 'credit', 'header',  '',                    '2000'),
    ('2201', 'Sueldos y salarios por pagar',                    'liability', 'credit', 'posting', 'balance_liability',   '2200'),
    ('2202', 'Vacaciones acumuladas',                           'liability', 'credit', 'posting', 'balance_liability',   '2200'),
    ('2203', 'Aguinaldo acumulado',                             'liability', 'credit', 'posting', 'balance_liability',   '2200'),
    ('2204', 'Bono 14 acumulado',                               'liability', 'credit', 'posting', 'balance_liability',   '2200'),
    ('2205', 'Otras prestaciones y obligaciones laborales',     'liability', 'credit', 'posting', 'balance_liability',   '2200'),
    ('2206', 'Cuotas patronales por pagar',                     'liability', 'credit', 'posting', 'balance_liability',   '2200'),
    ('2207', 'Retenciones laborales por pagar',                 'liability', 'credit', 'posting', 'balance_liability',   '2200'),
    ('2300', 'Impuestos y retenciones por pagar',               'liability', 'credit', 'header',  '',                    '2000'),
    ('2301', 'IVA débito fiscal',                               'liability', 'credit', 'posting', 'balance_liability',   '2300'),
    ('2302', 'IVA por liquidar',                                'liability', 'credit', 'posting', 'balance_liability',   '2300'),
    ('2303', 'ISR por pagar',                                   'liability', 'credit', 'posting', 'balance_liability',   '2300'),
    ('2304', 'Retenciones de ISR por pagar',                    'liability', 'credit', 'posting', 'balance_liability',   '2300'),
    ('2305', 'Otras retenciones tributarias',                   'liability', 'credit', 'posting', 'balance_liability',   '2300'),
    ('2306', 'Otros impuestos y contribuciones',                'liability', 'credit', 'posting', 'balance_liability',   '2300'),
    ('2400', 'Anticipos y obligaciones contractuales',          'liability', 'credit', 'header',  '',                    '2000'),
    ('2401', 'Anticipos recibidos de clientes',                 'liability', 'credit', 'posting', 'balance_liability',   '2400'),
    ('2402', 'Pasivos contractuales',                           'liability', 'credit', 'posting', 'balance_liability',   '2400'),
    ('2403', 'Depósitos y garantías recibidas',                 'liability', 'credit', 'posting', 'balance_liability',   '2400'),
    ('2404', 'Retenciones contractuales por pagar',             'liability', 'credit', 'posting', 'balance_liability',   '2400'),
    ('2500', 'Deuda financiera corriente',                      'liability', 'credit', 'header',  '',                    '2000'),
    ('2501', 'Préstamos bancarios a corto plazo',               'liability', 'credit', 'posting', 'balance_liability',   '2500'),
    ('2502', 'Porción corriente de préstamos a largo plazo',    'liability', 'credit', 'posting', 'balance_liability',   '2500'),
    ('2503', 'Arrendamientos financieros corrientes',           'liability', 'credit', 'posting', 'balance_liability',   '2500'),
    ('2600', 'Otras cuentas por pagar',                         'liability', 'credit', 'posting', 'balance_liability',   '2000'),
    ('2700', 'Pasivos no corrientes',                           'liability', 'credit', 'header',  '',                    '2000'),
    ('2710', 'Préstamos bancarios a largo plazo',               'liability', 'credit', 'posting', 'balance_liability',   '2700'),
    ('2720', 'Arrendamientos financieros a largo plazo',        'liability', 'credit', 'posting', 'balance_liability',   '2700'),
    ('2730', 'Provisiones de largo plazo',                      'liability', 'credit', 'posting', 'balance_liability',   '2700'),
    ('2740', 'Otras obligaciones a largo plazo',                'liability', 'credit', 'posting', 'balance_liability',   '2700'),

    # ── Clase 3 Patrimonio ────────────────────────────────────────────────────
    ('3000', 'PATRIMONIO NETO',                                 'equity',    'credit', 'header',  '',               None),
    ('3100', 'Capital social',                                  'equity',    'credit', 'posting', 'balance_equity', '3000'),
    ('3200', 'Aportes adicionales de socios',                   'equity',    'credit', 'posting', 'balance_equity', '3000'),
    ('3300', 'Reservas',                                        'equity',    'credit', 'posting', 'balance_equity', '3000'),
    ('3400', 'Resultados acumulados',                           'equity',    'credit', 'posting', 'balance_equity', '3000'),
    ('3500', 'Resultado del ejercicio',                         'equity',    'credit', 'posting', 'balance_equity', '3000'),
    ('3600', 'Dividendos y distribuciones aprobadas',           'equity',    'debit',  'posting', 'balance_equity', '3000'),

    # ── Clase 4 Ingresos ──────────────────────────────────────────────────────
    ('4000', 'INGRESOS DE EXPLOTACIÓN',                         'revenue',   'credit', 'header',  '',                    None),
    ('4100', 'Construcción nueva',                              'revenue',   'credit', 'header',  '',                    '4000'),
    ('4110', 'Construcción residencial',                        'revenue',   'credit', 'posting', 'gross_revenue',       '4100'),
    ('4120', 'Construcción comercial',                          'revenue',   'credit', 'posting', 'gross_revenue',       '4100'),
    ('4130', 'Ampliaciones y estructuras',                      'revenue',   'credit', 'posting', 'gross_revenue',       '4100'),
    ('4200', 'Remodelación integral',                           'revenue',   'credit', 'header',  '',                    '4000'),
    ('4210', 'Remodelación residencial',                        'revenue',   'credit', 'posting', 'gross_revenue',       '4200'),
    ('4220', 'Remodelación comercial y oficinas',               'revenue',   'credit', 'posting', 'gross_revenue',       '4200'),
    ('4230', 'Renovación de edificios',                         'revenue',   'credit', 'posting', 'gross_revenue',       '4200'),
    ('4300', 'Remodelación parcial',                            'revenue',   'credit', 'header',  '',                    '4000'),
    ('4310', 'Cocinas y mobiliario fijo',                       'revenue',   'credit', 'posting', 'gross_revenue',       '4300'),
    ('4320', 'Baños y fontanería',                              'revenue',   'credit', 'posting', 'gross_revenue',       '4300'),
    ('4330', 'Fachadas y cubiertas',                            'revenue',   'credit', 'posting', 'gross_revenue',       '4300'),
    ('4340', 'Pisos, pintura y acabados',                       'revenue',   'credit', 'posting', 'gross_revenue',       '4300'),
    ('4350', 'Instalaciones y reparaciones',                    'revenue',   'credit', 'posting', 'gross_revenue',       '4300'),
    ('4400', 'Servicios técnicos',                              'revenue',   'credit', 'header',  '',                    '4000'),
    ('4410', 'Diseño y planificación',                          'revenue',   'credit', 'posting', 'gross_revenue',       '4400'),
    ('4420', 'Supervisión y dirección de obra',                 'revenue',   'credit', 'posting', 'gross_revenue',       '4400'),
    ('4430', 'Estudios y servicios técnicos',                   'revenue',   'credit', 'posting', 'gross_revenue',       '4400'),
    ('4500', 'Modificaciones contractuales aprobadas',          'revenue',   'credit', 'header',  '',                    '4000'),
    ('4510', 'Trabajos adicionales aprobados',                  'revenue',   'credit', 'posting', 'gross_revenue',       '4500'),
    ('4520', 'Cambios de alcance aprobados',                    'revenue',   'credit', 'posting', 'gross_revenue',       '4500'),
    ('4600', 'Otros ingresos operativos',                       'revenue',   'credit', 'header',  '',                    '4000'),
    ('4610', 'Alquiler de equipos a terceros',                  'revenue',   'credit', 'posting', 'gross_revenue',       '4600'),
    ('4620', 'Otros servicios relacionados con construcción',   'revenue',   'credit', 'posting', 'gross_revenue',       '4600'),
    ('4900', 'Deducciones de ingresos',                         'revenue',   'debit',  'header',  '',                    '4000'),
    ('4910', 'Descuentos comerciales',                          'revenue',   'debit',  'posting', 'revenue_deductions',  '4900'),
    ('4920', 'Devoluciones y abonos',                           'revenue',   'debit',  'posting', 'revenue_deductions',  '4900'),
    ('4930', 'Penalizaciones como reducción de ingresos',       'revenue',   'debit',  'posting', 'revenue_deductions',  '4900'),

    # ── Clase 5 Costos directos ───────────────────────────────────────────────
    ('5000', 'COSTOS DIRECTOS DE OBRA',                         'expense',   'debit',  'header',  '',                           None),
    ('5100', 'Materiales consumidos',                           'expense',   'debit',  'header',  '',                           '5000'),
    ('5110', 'Cemento, concreto y morteros',                    'expense',   'debit',  'posting', 'direct_materials',           '5100'),
    ('5120', 'Arena, grava y agregados',                        'expense',   'debit',  'posting', 'direct_materials',           '5100'),
    ('5130', 'Acero y estructuras',                             'expense',   'debit',  'posting', 'direct_materials',           '5100'),
    ('5140', 'Bloques y mampostería',                           'expense',   'debit',  'posting', 'direct_materials',           '5100'),
    ('5150', 'Tablayeso y divisiones',                          'expense',   'debit',  'posting', 'direct_materials',           '5100'),
    ('5160', 'Cubiertas e impermeabilización',                  'expense',   'debit',  'posting', 'direct_materials',           '5100'),
    ('5170', 'Pisos y revestimientos',                          'expense',   'debit',  'posting', 'direct_materials',           '5100'),
    ('5180', 'Pinturas y acabados',                             'expense',   'debit',  'posting', 'direct_materials',           '5100'),
    ('5190', 'Puertas, ventanas, vidrio y aluminio',            'expense',   'debit',  'posting', 'direct_materials',           '5100'),
    ('5191', 'Carpintería y gabinetes',                         'expense',   'debit',  'posting', 'direct_materials',           '5100'),
    ('5192', 'Materiales eléctricos',                           'expense',   'debit',  'posting', 'direct_materials',           '5100'),
    ('5193', 'Fontanería y saneamiento',                        'expense',   'debit',  'posting', 'direct_materials',           '5100'),
    ('5194', 'Climatización y ventilación',                     'expense',   'debit',  'posting', 'direct_materials',           '5100'),
    ('5195', 'Consumibles de construcción',                     'expense',   'debit',  'posting', 'direct_materials',           '5100'),
    ('5196', 'Otros materiales directos',                       'expense',   'debit',  'posting', 'direct_materials',           '5100'),
    ('5200', 'Mano de obra directa',                            'expense',   'debit',  'header',  '',                           '5000'),
    ('5210', 'Albañiles y ayudantes',                           'expense',   'debit',  'posting', 'direct_labor',               '5200'),
    ('5220', 'Carpinteros y ebanistas',                         'expense',   'debit',  'posting', 'direct_labor',               '5200'),
    ('5230', 'Electricistas',                                   'expense',   'debit',  'posting', 'direct_labor',               '5200'),
    ('5240', 'Fontaneros',                                      'expense',   'debit',  'posting', 'direct_labor',               '5200'),
    ('5250', 'Soldadores y estructuristas',                     'expense',   'debit',  'posting', 'direct_labor',               '5200'),
    ('5260', 'Pintores e instaladores',                         'expense',   'debit',  'posting', 'direct_labor',               '5200'),
    ('5270', 'Operarios de maquinaria',                         'expense',   'debit',  'posting', 'direct_labor',               '5200'),
    ('5280', 'Supervisión imputable a obra',                    'expense',   'debit',  'posting', 'direct_labor',               '5200'),
    ('5290', 'Horas extraordinarias de obra',                   'expense',   'debit',  'posting', 'direct_labor',               '5200'),
    ('5291', 'Prestaciones y cargas laborales directas',        'expense',   'debit',  'posting', 'direct_labor',               '5200'),
    ('5300', 'Subcontratistas',                                 'expense',   'debit',  'header',  '',                           '5000'),
    ('5310', 'Albañilería y obra gris',                         'expense',   'debit',  'posting', 'subcontractors',             '5300'),
    ('5320', 'Electricidad y fontanería',                       'expense',   'debit',  'posting', 'subcontractors',             '5300'),
    ('5330', 'Estructuras metálicas',                           'expense',   'debit',  'posting', 'subcontractors',             '5300'),
    ('5340', 'Carpintería y ventanería',                        'expense',   'debit',  'posting', 'subcontractors',             '5300'),
    ('5350', 'Acabados e impermeabilización',                   'expense',   'debit',  'posting', 'subcontractors',             '5300'),
    ('5360', 'Especialidades técnicas',                         'expense',   'debit',  'posting', 'subcontractors',             '5300'),
    ('5370', 'Otros subcontratistas',                           'expense',   'debit',  'posting', 'subcontractors',             '5300'),
    ('5400', 'Maquinaria y equipos imputables',                 'expense',   'debit',  'header',  '',                           '5000'),
    ('5410', 'Alquiler de maquinaria',                          'expense',   'debit',  'posting', 'direct_equipment_logistics', '5400'),
    ('5420', 'Alquiler de herramientas y andamios',             'expense',   'debit',  'posting', 'direct_equipment_logistics', '5400'),
    ('5430', 'Combustible de equipos de obra',                  'expense',   'debit',  'posting', 'direct_equipment_logistics', '5400'),
    ('5440', 'Reparaciones de equipos imputables',              'expense',   'debit',  'posting', 'direct_equipment_logistics', '5400'),
    ('5450', 'Depreciación de maquinaria asignada a obra',      'expense',   'debit',  'posting', 'direct_equipment_logistics', '5400'),
    ('5460', 'Operadores y costos de uso imputables',           'expense',   'debit',  'posting', 'direct_equipment_logistics', '5400'),
    ('5500', 'Logística y costos auxiliares',                   'expense',   'debit',  'header',  '',                           '5000'),
    ('5510', 'Transporte de materiales',                        'expense',   'debit',  'posting', 'direct_equipment_logistics', '5500'),
    ('5520', 'Transporte de personal de obra',                  'expense',   'debit',  'posting', 'direct_equipment_logistics', '5500'),
    ('5530', 'Retiro de escombros',                             'expense',   'debit',  'posting', 'direct_equipment_logistics', '5500'),
    ('5540', 'Instalaciones provisionales',                     'expense',   'debit',  'posting', 'direct_equipment_logistics', '5500'),
    ('5550', 'Agua y electricidad de obra',                     'expense',   'debit',  'posting', 'direct_equipment_logistics', '5500'),
    ('5560', 'Seguridad específica de obra',                    'expense',   'debit',  'posting', 'direct_equipment_logistics', '5500'),
    ('5570', 'Ensayos y control de calidad',                    'expense',   'debit',  'posting', 'direct_equipment_logistics', '5500'),
    ('5580', 'Permisos y tasas directamente atribuibles',       'expense',   'debit',  'posting', 'direct_equipment_logistics', '5500'),
    ('5590', 'Seguros específicos de obra',                     'expense',   'debit',  'posting', 'direct_equipment_logistics', '5500'),
    ('5600', 'Costos directos de cierre y entrega',             'expense',   'debit',  'header',  '',                           '5000'),
    ('5610', 'Limpieza final',                                  'expense',   'debit',  'posting', 'direct_equipment_logistics', '5600'),
    ('5620', 'Correcciones y garantías atribuibles a obra',     'expense',   'debit',  'posting', 'direct_equipment_logistics', '5600'),
    ('5630', 'Otros costos directos de ejecución',              'expense',   'debit',  'posting', 'direct_equipment_logistics', '5600'),

    # ── Clase 6 Gastos de estructura ──────────────────────────────────────────
    ('6000', 'GASTOS DE ESTRUCTURA',                            'expense',   'debit',  'header',  '',                    None),
    ('6100', 'Personal de administración',                      'expense',   'debit',  'header',  '',                    '6000'),
    ('6110', 'Dirección general',                               'expense',   'debit',  'posting', 'overhead_staff',      '6100'),
    ('6120', 'Administración y finanzas',                       'expense',   'debit',  'posting', 'overhead_staff',      '6100'),
    ('6130', 'Compras y logística central',                     'expense',   'debit',  'posting', 'overhead_staff',      '6100'),
    ('6140', 'Recursos humanos',                                'expense',   'debit',  'posting', 'overhead_staff',      '6100'),
    ('6150', 'Contabilidad y facturación',                      'expense',   'debit',  'posting', 'overhead_staff',      '6100'),
    ('6160', 'Comercial y ventas',                              'expense',   'debit',  'posting', 'overhead_staff',      '6100'),
    ('6170', 'Marketing',                                       'expense',   'debit',  'posting', 'overhead_staff',      '6100'),
    ('6180', 'Personal técnico no imputado a obras',            'expense',   'debit',  'posting', 'overhead_staff',      '6100'),
    ('6190', 'Prestaciones y cargas laborales de estructura',   'expense',   'debit',  'posting', 'overhead_staff',      '6100'),
    ('6200', 'Oficinas e instalaciones',                        'expense',   'debit',  'header',  '',                    '6000'),
    ('6210', 'Alquiler de oficinas',                            'expense',   'debit',  'posting', 'overhead_general',    '6200'),
    ('6220', 'Electricidad, agua e internet',                   'expense',   'debit',  'posting', 'overhead_general',    '6200'),
    ('6230', 'Telefonía y comunicaciones',                      'expense',   'debit',  'posting', 'overhead_general',    '6200'),
    ('6240', 'Limpieza y mantenimiento',                        'expense',   'debit',  'posting', 'overhead_general',    '6200'),
    ('6250', 'Seguridad de instalaciones',                      'expense',   'debit',  'posting', 'overhead_general',    '6200'),
    ('6260', 'Papelería y suministros',                         'expense',   'debit',  'posting', 'overhead_general',    '6200'),
    ('6300', 'Vehículos de estructura',                         'expense',   'debit',  'header',  '',                    '6000'),
    ('6310', 'Combustible corporativo',                         'expense',   'debit',  'posting', 'overhead_general',    '6300'),
    ('6320', 'Mantenimiento y reparaciones',                    'expense',   'debit',  'posting', 'overhead_general',    '6300'),
    ('6330', 'Seguros y circulación',                           'expense',   'debit',  'posting', 'overhead_general',    '6300'),
    ('6340', 'Alquiler de vehículos',                           'expense',   'debit',  'posting', 'overhead_general',    '6300'),
    ('6350', 'Depreciación de vehículos corporativos',          'expense',   'debit',  'posting', 'overhead_general',    '6300'),
    ('6400', 'Servicios profesionales',                         'expense',   'debit',  'header',  '',                    '6000'),
    ('6410', 'Asesoría contable y fiscal',                      'expense',   'debit',  'posting', 'overhead_general',    '6400'),
    ('6420', 'Asesoría jurídica',                               'expense',   'debit',  'posting', 'overhead_general',    '6400'),
    ('6430', 'Auditoría',                                       'expense',   'debit',  'posting', 'overhead_general',    '6400'),
    ('6440', 'Consultoría y servicios externos',                'expense',   'debit',  'posting', 'overhead_general',    '6400'),
    ('6450', 'Seguros generales',                               'expense',   'debit',  'posting', 'overhead_general',    '6400'),
    ('6460', 'Licencias y membresías',                          'expense',   'debit',  'posting', 'overhead_general',    '6400'),
    ('6500', 'Tecnología y sistemas',                           'expense',   'debit',  'header',  '',                    '6000'),
    ('6510', 'ERP y software de gestión',                       'expense',   'debit',  'posting', 'overhead_general',    '6500'),
    ('6520', 'Software técnico y presupuestos',                 'expense',   'debit',  'posting', 'overhead_general',    '6500'),
    ('6530', 'CRM y herramientas comerciales',                  'expense',   'debit',  'posting', 'overhead_general',    '6500'),
    ('6540', 'Servicios en la nube',                            'expense',   'debit',  'posting', 'overhead_general',    '6500'),
    ('6550', 'Equipos informáticos y soporte',                  'expense',   'debit',  'posting', 'overhead_general',    '6500'),
    ('6560', 'Ciberseguridad',                                  'expense',   'debit',  'posting', 'overhead_general',    '6500'),
    ('6600', 'Comercialización',                                'expense',   'debit',  'header',  '',                    '6000'),
    ('6610', 'Publicidad digital',                              'expense',   'debit',  'posting', 'overhead_commercial', '6600'),
    ('6620', 'Página web y generación de demanda',              'expense',   'debit',  'posting', 'overhead_commercial', '6600'),
    ('6630', 'Comisiones comerciales',                          'expense',   'debit',  'posting', 'overhead_commercial', '6600'),
    ('6640', 'Preparación de propuestas',                       'expense',   'debit',  'posting', 'overhead_commercial', '6600'),
    ('6650', 'Visitas y presentaciones',                        'expense',   'debit',  'posting', 'overhead_commercial', '6600'),
    ('6700', 'Otros gastos generales',                          'expense',   'debit',  'header',  '',                    '6000'),
    ('6710', 'Formación corporativa',                           'expense',   'debit',  'posting', 'overhead_general',    '6700'),
    ('6720', 'Viajes y dietas de estructura',                   'expense',   'debit',  'posting', 'overhead_general',    '6700'),
    ('6730', 'Gastos bancarios operativos',                     'expense',   'debit',  'posting', 'overhead_general',    '6700'),
    ('6740', 'Incobrables y deterioros comerciales',            'expense',   'debit',  'posting', 'overhead_general',    '6700'),
    ('6750', 'Pérdidas operativas no asignables a obra',        'expense',   'debit',  'posting', 'overhead_general',    '6700'),
    ('6790', 'Otros gastos de estructura',                      'expense',   'debit',  'posting', 'overhead_general',    '6700'),

    # ── Clase 7 D&A y otros operativos ────────────────────────────────────────
    ('7000', 'Depreciaciones y amortizaciones no imputadas',    'expense',   'debit',  'header',  '',                  None),
    ('7010', 'Depreciación de maquinaria compartida',           'expense',   'debit',  'posting', 'depreciation_amort', '7000'),
    ('7020', 'Depreciación de edificios e instalaciones',       'expense',   'debit',  'posting', 'depreciation_amort', '7000'),
    ('7030', 'Depreciación de mobiliario y equipos',            'expense',   'debit',  'posting', 'depreciation_amort', '7000'),
    ('7040', 'Amortización de software e intangibles',          'expense',   'debit',  'posting', 'depreciation_amort', '7000'),
    ('7100', 'Otros resultados operativos',                     'expense',   'debit',  'header',  '',                  '7000'),
    ('7110', 'Ganancia o pérdida por baja de activos',          'expense',   'debit',  'posting', 'other_operating',   '7100'),
    ('7120', 'Deterioros y provisiones operativas',             'expense',   'debit',  'posting', 'other_operating',   '7100'),
    ('7130', 'Otros resultados no recurrentes',                 'expense',   'debit',  'posting', 'other_operating',   '7100'),

    # ── Clase 8 Resultado financiero ──────────────────────────────────────────
    ('8000', 'Ingresos financieros',                            'revenue',   'credit', 'header',  '',                  None),
    ('8010', 'Intereses ganados',                               'revenue',   'credit', 'posting', 'financial_income',  '8000'),
    ('8020', 'Otros ingresos financieros',                      'revenue',   'credit', 'posting', 'financial_income',  '8000'),
    ('8100', 'Gastos financieros',                              'expense',   'debit',  'header',  '',                  None),
    ('8110', 'Intereses de préstamos bancarios',                'expense',   'debit',  'posting', 'financial_expense', '8100'),
    ('8120', 'Intereses de líneas de crédito',                  'expense',   'debit',  'posting', 'financial_expense', '8100'),
    ('8130', 'Financiación de maquinaria',                      'expense',   'debit',  'posting', 'financial_expense', '8100'),
    ('8140', 'Comisiones de financiamiento',                    'expense',   'debit',  'posting', 'financial_expense', '8100'),
    ('8150', 'Diferencias de cambio',                           'expense',   'debit',  'posting', 'financial_expense', '8100'),
    ('8160', 'Otros gastos financieros',                        'expense',   'debit',  'posting', 'financial_expense', '8100'),

    # ── Clase 9 Impuesto y cierre ─────────────────────────────────────────────
    ('9000', 'Impuesto sobre beneficios',                       'expense',   'debit',  'header',  '',            None),
    ('9010', 'Impuesto corriente',                              'expense',   'debit',  'posting', 'income_tax',  '9000'),
    ('9020', 'Impuesto diferido',                               'expense',   'debit',  'posting', 'income_tax',  '9000'),
    ('9100', 'Resultado del ejercicio',                         'equity',    'credit', 'header',  '',            None),
    ('9110', 'Traspaso del resultado del período',              'equity',    'credit', 'posting', '',            '9100'),
    ('9120', 'Cierre contable',                                 'equity',    'credit', 'posting', '',            '9100'),
]

# ─── Centros de costo base ────────────────────────────────────────────────────

COST_CENTERS = [
    ('OBRA',        'Obra / Producción directa',       'obra'),
    ('ADMIN',       'Administración',                  'admin'),
    ('COMERCIAL',   'Comercial y Marketing',           'comercial'),
    ('MAQUINARIA',  'Maquinaria y Equipos',            'maquinaria'),
    ('OPERACIONES', 'Operaciones y Logística',         'operaciones'),
]

# ─── Códigos de costo base ────────────────────────────────────────────────────
# Formato: (code, description, category, cost_behavior)

COST_CODES = [
    # Materiales
    ('MAT-CEM',  'Cemento, concreto y morteros',         'materials',     'variable'),
    ('MAT-AGR',  'Arena, grava y agregados',             'materials',     'variable'),
    ('MAT-ACE',  'Acero y estructuras',                  'materials',     'variable'),
    ('MAT-MAM',  'Bloques y mampostería',                'materials',     'variable'),
    ('MAT-ELE',  'Materiales eléctricos',                'materials',     'variable'),
    ('MAT-FON',  'Fontanería y saneamiento',             'materials',     'variable'),
    ('MAT-PIN',  'Pinturas y acabados',                  'materials',     'variable'),
    ('MAT-CAR',  'Carpintería, puertas y ventanas',      'materials',     'variable'),
    ('MAT-PIZ',  'Pisos y revestimientos',               'materials',     'variable'),
    ('MAT-OTR',  'Otros materiales directos',            'materials',     'variable'),
    # Mano de obra directa
    ('MOD-ALB',  'Albañiles y ayudantes',                'labor',         'semi_variable'),
    ('MOD-ELE',  'Electricistas',                        'labor',         'semi_variable'),
    ('MOD-FON',  'Fontaneros',                           'labor',         'semi_variable'),
    ('MOD-CAR',  'Carpinteros y ebanistas',              'labor',         'semi_variable'),
    ('MOD-PIN',  'Pintores e instaladores',              'labor',         'semi_variable'),
    ('MOD-SUP',  'Supervisión imputable a obra',         'labor',         'fixed'),
    ('MOD-OPE',  'Operarios de maquinaria',              'labor',         'semi_variable'),
    ('MOD-EXT',  'Horas extraordinarias de obra',        'labor',         'variable'),
    # Subcontratistas
    ('SUB-OBG',  'Subcontrato obra gris',                'subcontractor', 'variable'),
    ('SUB-ELE',  'Subcontrato electricidad y fontanería','subcontractor', 'variable'),
    ('SUB-MET',  'Subcontrato estructuras metálicas',    'subcontractor', 'variable'),
    ('SUB-CAR',  'Subcontrato carpintería y ventanería', 'subcontractor', 'variable'),
    ('SUB-ACA',  'Subcontrato acabados',                 'subcontractor', 'variable'),
    ('SUB-OTR',  'Otros subcontratistas',                'subcontractor', 'variable'),
    # Equipos y maquinaria
    ('EQP-ALQ',  'Alquiler de maquinaria',               'equipment',     'variable'),
    ('EQP-COM',  'Combustible de equipos de obra',       'equipment',     'variable'),
    ('EQP-REP',  'Reparaciones de equipos en obra',      'equipment',     'variable'),
    ('EQP-DEP',  'Depreciación de maquinaria en obra',   'equipment',     'fixed'),
    # Logística y auxiliares
    ('LOG-TRA',  'Transporte de materiales',             'logistics',     'variable'),
    ('LOG-PER',  'Transporte de personal',               'logistics',     'variable'),
    ('LOG-ESC',  'Retiro de escombros',                  'logistics',     'variable'),
    ('LOG-PER2', 'Permisos y tasas de obra',             'logistics',     'variable'),
    ('LOG-SEG',  'Seguros específicos de obra',          'logistics',     'fixed'),
    # Overhead
    ('OVH-ADM',  'Gastos administrativos generales',     'overhead',      'fixed'),
    ('OVH-COM',  'Gastos comerciales y marketing',       'overhead',      'fixed'),
    ('OVH-TEC',  'Tecnología y sistemas',                'overhead',      'fixed'),
]


class Command(BaseCommand):
    help = 'Carga el catálogo de cuentas, centros de costo y códigos de costo base en el ERP.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Elimina y recrea todos los registros (solo usar en desarrollo).',
        )

    def handle(self, *args, **options):
        if options['reset']:
            self.stdout.write(self.style.WARNING('Eliminando datos existentes...'))
            Account.objects.all().delete()
            CostCenter.objects.all().delete()
            CostCode.objects.all().delete()

        self._seed_accounts()
        self._seed_cost_centers()
        self._seed_cost_codes()
        self.stdout.write(self.style.SUCCESS('✓ Seed completado correctamente.'))

    def _seed_accounts(self):
        self.stdout.write('  → Catálogo de cuentas...')
        # Primera pasada: crear todas las cuentas sin padre
        created = 0
        skipped = 0
        code_map = {}

        for row in ACCOUNTS:
            code, name, atype, nature, level, pl_group, parent_code = row
            obj, was_created = Account.objects.get_or_create(
                code=code,
                defaults={
                    'name': name,
                    'account_type': atype,
                    'nature': nature,
                    'level': level,
                    'pl_group': pl_group,
                },
            )
            code_map[code] = obj
            if was_created:
                created += 1
            else:
                skipped += 1

        # Segunda pasada: asignar padres
        for row in ACCOUNTS:
            code, _, _, _, _, _, parent_code = row
            if parent_code and parent_code in code_map:
                obj = code_map[code]
                if obj.parent_id != code_map[parent_code].pk:
                    obj.parent = code_map[parent_code]
                    obj.save(update_fields=['parent'])

        self.stdout.write(f'     Creadas: {created} | Ya existentes: {skipped}')

    def _seed_cost_centers(self):
        self.stdout.write('  → Centros de costo...')
        created = 0
        for code, name, center_type in COST_CENTERS:
            _, was_created = CostCenter.objects.get_or_create(
                code=code,
                defaults={'name': name, 'center_type': center_type},
            )
            if was_created:
                created += 1
        self.stdout.write(f'     Creados: {created}')

    def _seed_cost_codes(self):
        self.stdout.write('  → Códigos de costo...')
        created = 0
        for code, description, category, behavior in COST_CODES:
            _, was_created = CostCode.objects.get_or_create(
                code=code,
                defaults={
                    'description': description,
                    'category': category,
                    'cost_behavior': behavior,
                },
            )
            if was_created:
                created += 1
        self.stdout.write(f'     Creados: {created}')
