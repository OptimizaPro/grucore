"""
python manage.py seed_cms

Carga el contenido inicial del CMS con las 5 páginas del sitio (ES + EN).
Idempotente: si ya existe el contenido, lo actualiza; si no, lo crea.
"""
import json
from django.core.management.base import BaseCommand
from apps.cms.models import Page, Section, Block


# ─── Datos de contenido ───────────────────────────────────────────────────────

PAGES = [

    # ── HOME ──────────────────────────────────────────────────────────────────
    {
        'slug': 'home',
        'title_es': 'Inicio',
        'title_en': 'Home',
        'meta_description_es': 'Empresa de construcción y remodelación premium en Guatemala. Proyectos residenciales y comerciales con los más altos estándares de calidad.',
        'meta_description_en': 'Premium construction and remodeling company in Guatemala. Residential and commercial projects with the highest quality standards.',
        'sections': [
            {
                'key': 'hero', 'label': 'Hero — Banner principal', 'order': 1,
                'blocks': [
                    {'key': 'eyebrow',       'label': 'Eyebrow',         'type': 'text',   'es': 'Empresa guatemalteca de construcción premium',                                                    'en': 'Guatemalan premium construction company'},
                    {'key': 'headline_1',    'label': 'Titular línea 1', 'type': 'text',   'es': 'CONSTRUIMOS',                                                                                     'en': 'WE BUILD'},
                    {'key': 'headline_2',    'label': 'Titular línea 2', 'type': 'text',   'es': 'ESPACIOS',                                                                                        'en': 'EXTRAORDINARY'},
                    {'key': 'headline_3',    'label': 'Titular línea 3', 'type': 'text',   'es': 'EXTRAORDINARIOS',                                                                                 'en': 'SPACES'},
                    {'key': 'cta_primary',   'label': 'CTA principal',   'type': 'text',   'es': 'Solicitar cotización gratuita',                                                                   'en': 'Get a free estimate'},
                    {'key': 'cta_secondary', 'label': 'CTA secundario',  'type': 'text',   'es': 'Ver proyectos',                                                                                   'en': 'View projects'},
                ],
            },
            {
                'key': 'trust_bar', 'label': 'Barra de confianza — Estadísticas', 'order': 2,
                'blocks': [
                    {'key': 'stat_1_value', 'label': 'Stat 1 — Valor',  'type': 'text', 'es': '50',                         'en': '50'},
                    {'key': 'stat_1_label', 'label': 'Stat 1 — Label',  'type': 'text', 'es': 'proyectos entregados',        'en': 'projects delivered'},
                    {'key': 'stat_2_value', 'label': 'Stat 2 — Valor',  'type': 'text', 'es': '8',                          'en': '8'},
                    {'key': 'stat_2_label', 'label': 'Stat 2 — Label',  'type': 'text', 'es': 'años de experiencia',         'en': 'years of experience'},
                    {'key': 'stat_3_value', 'label': 'Stat 3 — Valor',  'type': 'text', 'es': '24h',                        'en': '24h'},
                    {'key': 'stat_3_label', 'label': 'Stat 3 — Label',  'type': 'text', 'es': 'de respuesta',                'en': 'response time'},
                    {'key': 'stat_4_value', 'label': 'Stat 4 — Valor',  'type': 'text', 'es': '1',                          'en': '1'},
                    {'key': 'stat_4_label', 'label': 'Stat 4 — Label',  'type': 'text', 'es': 'asesor único asignado',       'en': 'dedicated advisor'},
                ],
            },
            {
                'key': 'services', 'label': 'Sección de servicios', 'order': 3,
                'blocks': [
                    {'key': 'eyebrow',  'label': 'Eyebrow',    'type': 'text',     'es': 'Nuestros servicios',                                                                                                                                                 'en': 'Our services'},
                    {'key': 'title',    'label': 'Título',      'type': 'text',     'es': 'Soluciones para cada tipo de proyecto',                                                                                                                              'en': 'Solutions for every project type'},
                    {'key': 'subtitle', 'label': 'Subtítulo',   'type': 'text',     'es': 'Desde una remodelación residencial hasta un desarrollo comercial a gran escala, nuestro equipo cubre todo el ciclo del proyecto.',                                   'en': 'From residential remodeling to large-scale commercial development, our team covers the full project lifecycle.'},
                    {'key': 'items',    'label': 'Tarjetas de servicio (JSON)', 'type': 'json', 'es': json.dumps([
                        {'id': 'residential',  'title': 'Construcción Residencial', 'description': 'Diseñamos y construimos la residencia que imaginaste, con materiales de primera y tiempos cumplidos.',                                                                         'tags': ['Casas', 'Residencias', 'Townhouses'],          'range': 'Q 300,000 – Q 2,500,000'},
                        {'id': 'remodeling',   'title': 'Remodelación Interior',    'description': 'Transformamos espacios existentes con criterio de diseño y ejecución limpia, sin interrumpir tu rutina más de lo necesario.',                                                  'tags': ['Cocinas', 'Baños', 'Sala', 'Completa'],        'range': 'Q 50,000 – Q 500,000'},
                        {'id': 'commercial',   'title': 'Proyectos Comerciales',    'description': 'Oficinas, locales, restaurantes y desarrollos mixtos. Cumplimos cronogramas porque entendemos el costo de cada día de retraso.',                                              'tags': ['Oficinas', 'Restaurantes', 'Retail'],          'range': 'Q 200,000 – Q 5,000,000'},
                        {'id': 'design_build', 'title': 'Diseño y Construcción',    'description': 'Arquitectura, ingeniería y ejecución bajo un solo contrato. Reducimos tiempos de coordinación y evitamos inconsistencias entre planos y obra.',                              'tags': ['Diseño', 'Ingeniería', 'Ejecución'],           'range': 'Q 400,000 – Q 3,000,000'},
                        {'id': 'industrial',   'title': 'Construcción Industrial',  'description': 'Bodegas, naves industriales y plantas de producción. Estructuras eficientes con enfoque en funcionalidad operativa.',                                                         'tags': ['Bodegas', 'Naves', 'Plantas'],                 'range': 'Q 500,000 – Q 8,000,000'},
                        {'id': 'finishing',    'title': 'Acabados Premium',         'description': 'Pisos, cielos, carpintería fina, pintura y detalles de cierre. El último 20% que marca la diferencia visual.',                                                               'tags': ['Pisos', 'Carpintería', 'Pintura'],             'range': 'Q 30,000 – Q 300,000'},
                    ], ensure_ascii=False), 'en': json.dumps([
                        {'id': 'residential',  'title': 'Residential Construction', 'description': 'We design and build the home you imagined, with premium materials and on-time delivery.',                                                                                     'tags': ['Houses', 'Residences', 'Townhouses'],          'range': '$ 39,000 – $ 325,000'},
                        {'id': 'remodeling',   'title': 'Interior Remodeling',      'description': 'We transform existing spaces with design precision and clean execution, minimizing disruption to your daily routine.',                                                        'tags': ['Kitchens', 'Bathrooms', 'Living room', 'Full'], 'range': '$ 6,500 – $ 65,000'},
                        {'id': 'commercial',   'title': 'Commercial Projects',      'description': 'Offices, retail spaces, restaurants and mixed developments. We meet timelines because we understand the cost of every delay.',                                                'tags': ['Offices', 'Restaurants', 'Retail'],            'range': '$ 26,000 – $ 650,000'},
                        {'id': 'design_build', 'title': 'Design + Build',           'description': 'Architecture, engineering and execution under a single contract. Reducing coordination time and eliminating inconsistencies between plans and site.',                         'tags': ['Design', 'Engineering', 'Execution'],          'range': '$ 52,000 – $ 390,000'},
                        {'id': 'industrial',   'title': 'Industrial Construction',  'description': 'Warehouses, industrial facilities and production plants. Efficient structures focused on operational functionality.',                                                         'tags': ['Warehouses', 'Facilities', 'Plants'],          'range': '$ 65,000 – $ 1,040,000'},
                        {'id': 'finishing',    'title': 'Premium Finishes',         'description': 'Flooring, ceilings, fine carpentry, paint and closing details. The last 20% that makes the visual difference.',                                                              'tags': ['Flooring', 'Carpentry', 'Paint'],              'range': '$ 3,900 – $ 39,000'},
                    ], ensure_ascii=False)},
                ],
            },
            {
                'key': 'process', 'label': 'Proceso de trabajo', 'order': 4,
                'blocks': [
                    {'key': 'eyebrow', 'label': 'Eyebrow', 'type': 'text', 'es': 'Cómo trabajamos',                          'en': 'How we work'},
                    {'key': 'title',   'label': 'Título',  'type': 'text', 'es': 'Un proceso claro desde el primer contacto', 'en': 'A clear process from the first contact'},
                    {'key': 'steps',   'label': 'Pasos (JSON)', 'type': 'json', 'es': json.dumps([
                        {'number': '01', 'title': 'Consulta inicial',           'description': 'Evaluamos tu proyecto sin costo. En 24 horas tienes una respuesta y un asesor asignado que será tu punto de contacto durante todo el proceso.'},
                        {'number': '02', 'title': 'Planificación y presupuesto','description': 'Elaboramos planos, especificaciones técnicas y un presupuesto detallado. Sin sorpresas: cada ítem queda documentado antes de iniciar.'},
                        {'number': '03', 'title': 'Ejecución',                  'description': 'Construimos con supervisión diaria. Recibes actualizaciones de avance, fotos y acceso a tu portal de cliente en tiempo real.'},
                        {'number': '04', 'title': 'Entrega y garantía',         'description': 'Entrega formal con recorrido detallado, lista de pendientes resuelta y garantía de trabajo. Tu espacio, listo para habitarlo.'},
                    ], ensure_ascii=False), 'en': json.dumps([
                        {'number': '01', 'title': 'Initial consultation',  'description': 'We evaluate your project at no cost. Within 24 hours you have a response and a dedicated advisor who will be your single point of contact throughout.'},
                        {'number': '02', 'title': 'Planning & budget',     'description': 'We prepare plans, technical specifications and a detailed budget. No surprises: every line item is documented before we break ground.'},
                        {'number': '03', 'title': 'Execution',             'description': 'We build with daily supervision. You receive progress updates, photos and access to your client portal in real time.'},
                        {'number': '04', 'title': 'Delivery & warranty',   'description': 'Formal handover with detailed walkthrough, resolved punch list and work warranty. Your space, ready to move in.'},
                    ], ensure_ascii=False)},
                ],
            },
            {
                'key': 'before_after', 'label': 'Antes y después', 'order': 5,
                'blocks': [
                    {'key': 'eyebrow',    'label': 'Eyebrow',           'type': 'text', 'es': 'Transformaciones',              'en': 'Transformations'},
                    {'key': 'title',      'label': 'Título',             'type': 'text', 'es': 'El antes y el después lo dice todo', 'en': 'Before and after says it all'},
                    {'key': 'before_label','label': 'Etiqueta "Antes"', 'type': 'text', 'es': 'Antes',                         'en': 'Before'},
                    {'key': 'after_label', 'label': 'Etiqueta "Después"','type': 'text', 'es': 'Después',                      'en': 'After'},
                    {'key': 'drag_hint',  'label': 'Hint de arrastre',   'type': 'text', 'es': 'Arrastra para comparar',        'en': 'Drag to compare'},
                ],
            },
            {
                'key': 'pricing', 'label': 'Rangos de precios', 'order': 6,
                'blocks': [
                    {'key': 'eyebrow',    'label': 'Eyebrow',     'type': 'text', 'es': 'Transparencia de precios',                                                                                                                                                                                     'en': 'Transparent pricing'},
                    {'key': 'title',      'label': 'Título',      'type': 'text', 'es': 'Sin sorpresas. Rangos reales por tipo de proyecto.',                                                                                                                                                           'en': 'No surprises. Real ranges by project type.'},
                    {'key': 'subtitle',   'label': 'Subtítulo',   'type': 'text', 'es': 'Publicamos rangos basados en proyectos ejecutados. La cotización exacta depende de especificaciones, materiales y ubicación. Siempre sin costo.',                                                              'en': 'We publish ranges based on executed projects. The exact quote depends on specifications, materials and location. Always free.'},
                    {'key': 'disclaimer', 'label': 'Nota legal',  'type': 'text', 'es': '* Precios en Quetzales (GTQ). Incluyen mano de obra y materiales estándar. Acabados premium tienen costo adicional.',                                                                                         'en': '* Prices in Guatemalan Quetzales (GTQ). Include standard labor and materials. Premium finishes are additional.'},
                    {'key': 'tiers',      'label': 'Niveles de precio (JSON)', 'type': 'json', 'es': json.dumps([
                        {'tag': 'REMODELACIÓN', 'title': 'Remodelación parcial',           'description': 'Cocina, baños o espacios puntuales de una vivienda existente.',                       'price': 'Q 50,000 – Q 150,000',    'duration': '1 – 3 meses',  'featured': False},
                        {'tag': 'RESIDENCIAL',  'title': 'Remodelación completa o casa nueva','description': 'Remodelación total de vivienda o construcción nueva hasta 300 m².',                'price': 'Q 200,000 – Q 900,000',   'duration': '3 – 10 meses', 'featured': True},
                        {'tag': 'COMERCIAL / INDUSTRIAL', 'title': 'Proyecto mayor',       'description': 'Desarrollos comerciales, industriales o residenciales de gran escala.',              'price': 'Q 1,000,000+',            'duration': 'A definir',    'featured': False},
                    ], ensure_ascii=False), 'en': json.dumps([
                        {'tag': 'REMODELING',           'title': 'Partial remodeling',   'description': 'Kitchen, bathrooms or specific spaces in an existing home.',                           'price': '$ 6,500 – $ 19,500',      'duration': '1 – 3 months', 'featured': False},
                        {'tag': 'RESIDENTIAL',          'title': 'Full remodel or new home','description': 'Complete home remodeling or new construction up to 300 m².',                         'price': '$ 26,000 – $ 117,000',    'duration': '3 – 10 months','featured': True},
                        {'tag': 'COMMERCIAL / INDUSTRIAL','title': 'Large-scale project', 'description': 'Commercial, industrial or large residential developments.',                            'price': '$ 130,000+',              'duration': 'To be defined','featured': False},
                    ], ensure_ascii=False)},
                ],
            },
            {
                'key': 'testimonials', 'label': 'Testimonios', 'order': 7,
                'blocks': [
                    {'key': 'eyebrow', 'label': 'Eyebrow', 'type': 'text', 'es': 'Clientes',                                    'en': 'Clients'},
                    {'key': 'title',   'label': 'Título',  'type': 'text', 'es': 'Lo que dicen quienes ya confían en nosotros', 'en': 'What those who trust us say'},
                    {'key': 'items',   'label': 'Testimonios (JSON)', 'type': 'json', 'es': json.dumps([
                        {'quote': 'Cumplieron el cronograma a la semana. Llevan años trabajando con nosotros en cada expansión de la empresa.', 'name': 'Carlos Mendoza', 'role': 'Director de Operaciones', 'company': 'Grupo Empresarial CM'},
                        {'quote': 'La remodelación de nuestra casa quedó exactamente como la imaginamos. El portal de seguimiento nos daba paz mental.', 'name': 'Ana Lucía Herrera', 'role': 'Propietaria', 'company': 'Residencia privada, Zona 15'},
                        {'quote': 'De todos los contratistas que evaluamos, Grucore fue el único que presentó un presupuesto detallado ítem por ítem desde el inicio.', 'name': 'Roberto Cifuentes', 'role': 'Gerente General', 'company': 'Restaurante La Corriente'},
                    ], ensure_ascii=False), 'en': json.dumps([
                        {'quote': 'They met the schedule to the week. They\'ve worked with us for years on every company expansion.', 'name': 'Carlos Mendoza', 'role': 'Director of Operations', 'company': 'Grupo Empresarial CM'},
                        {'quote': 'The remodeling of our home came out exactly as we imagined. The progress portal gave us peace of mind.', 'name': 'Ana Lucía Herrera', 'role': 'Owner', 'company': 'Private residence, Zone 15'},
                        {'quote': 'Of all the contractors we evaluated, Grucore was the only one that presented a line-item budget from the start.', 'name': 'Roberto Cifuentes', 'role': 'General Manager', 'company': 'La Corriente Restaurant'},
                    ], ensure_ascii=False)},
                ],
            },
            {
                'key': 'cta', 'label': 'CTA — Llamada a la acción final', 'order': 8,
                'blocks': [
                    {'key': 'eyebrow',    'label': 'Eyebrow',         'type': 'text', 'es': '¿Tienes un proyecto en mente?',                                                                                              'en': 'Have a project in mind?'},
                    {'key': 'title',      'label': 'Título',           'type': 'text', 'es': 'Cotización gratuita en 24 horas',                                                                                           'en': 'Free estimate in 24 hours'},
                    {'key': 'subtitle',   'label': 'Subtítulo',        'type': 'text', 'es': 'Sin compromiso. Un asesor especializado revisa tu caso y te entrega una estimación real, no un rango genérico.',            'en': 'No commitment. A specialized advisor reviews your case and delivers a real estimate, not a generic range.'},
                    {'key': 'button',     'label': 'Botón principal',  'type': 'text', 'es': 'Iniciar mi cotización',                                                                                                     'en': 'Start my estimate'},
                    {'key': 'secondary',  'label': 'Texto secundario', 'type': 'text', 'es': 'o llama al +502 2000-0000',                                                                                                 'en': 'or call +502 2000-0000'},
                    {'key': 'trust_1',    'label': 'Señal de confianza 1', 'type': 'text', 'es': 'Sin costo ni compromiso',     'en': 'No cost · No obligation'},
                    {'key': 'trust_2',    'label': 'Señal de confianza 2', 'type': 'text', 'es': 'Respuesta en menos de 24 horas', 'en': 'Response within 24 h'},
                    {'key': 'trust_3',    'label': 'Señal de confianza 3', 'type': 'text', 'es': 'Asesor especializado asignado', 'en': 'Specialized advisor assigned'},
                ],
            },
        ],
    },

    # ── ABOUT ─────────────────────────────────────────────────────────────────
    {
        'slug': 'about',
        'title_es': 'Nosotros',
        'title_en': 'About',
        'meta_description_es': 'Empresa guatemalteca de construcción y remodelación premium con más de 8 años transformando espacios.',
        'meta_description_en': 'Guatemalan premium construction and remodeling company with over 8 years transforming spaces.',
        'sections': [
            {
                'key': 'hero', 'label': 'Hero', 'order': 1,
                'blocks': [
                    {'key': 'eyebrow',  'label': 'Eyebrow',   'type': 'text', 'es': 'Quiénes somos',                                                                                                                'en': 'Who we are'},
                    {'key': 'title',    'label': 'Título',     'type': 'text', 'es': 'Construimos con propósito, entregamos con precisión',                                                                          'en': 'We build with purpose, we deliver with precision'},
                    {'key': 'subtitle', 'label': 'Subtítulo',  'type': 'text', 'es': 'Empresa guatemalteca de construcción y remodelación premium. Más de 8 años transformando espacios en todo el país con los más altos estándares de calidad.', 'en': 'Guatemalan premium construction and remodeling company. Over 8 years transforming spaces throughout the country with the highest quality standards.'},
                ],
            },
            {
                'key': 'story', 'label': 'Nuestra historia', 'order': 2,
                'blocks': [
                    {'key': 'eyebrow', 'label': 'Eyebrow',    'type': 'text', 'es': 'Nuestra historia',                              'en': 'Our story'},
                    {'key': 'title',   'label': 'Título',      'type': 'text', 'es': 'De obra en obra, construimos una reputación',   'en': 'Project by project, we built a reputation'},
                    {'key': 'p1',      'label': 'Párrafo 1',   'type': 'text', 'es': 'Grucore nació en 2016 con un objetivo claro: cambiar la forma en que se construye en Guatemala. En un mercado donde los retrasos, los presupuestos inflados y la falta de comunicación eran la norma, decidimos que podía hacerse diferente.',
                                                                                 'en': 'Grucore was born in 2016 with a clear objective: to change the way construction is done in Guatemala. In a market where delays, inflated budgets and lack of communication were the norm, we decided it could be done differently.'},
                    {'key': 'p2',      'label': 'Párrafo 2',   'type': 'text', 'es': 'Hoy somos el equipo de confianza de familias, empresas y desarrolladores que no quieren sorpresas. Cada proyecto lleva nuestro nombre — y eso lo tomamos en serio.',
                                                                                 'en': 'Today we are the trusted team of families, businesses and developers who want no surprises. Every project carries our name — and we take that seriously.'},
                    {'key': 'p3',      'label': 'Párrafo 3',   'type': 'text', 'es': 'Más de 50 proyectos entregados. Cronogramas cumplidos. Presupuestos respetados. Clientes que regresan.',
                                                                                 'en': 'Over 50 projects delivered. Schedules met. Budgets respected. Clients who come back.'},
                ],
            },
            {
                'key': 'stats', 'label': 'Estadísticas', 'order': 3,
                'blocks': [
                    {'key': 'items', 'label': 'Estadísticas (JSON)', 'type': 'json',
                     'es': json.dumps([
                         {'value': '50+', 'label': 'Proyectos entregados'},
                         {'value': '8',   'label': 'Años de experiencia'},
                         {'value': '100%','label': 'Clientes con asesor dedicado'},
                         {'value': '24h', 'label': 'Tiempo de respuesta'},
                     ], ensure_ascii=False),
                     'en': json.dumps([
                         {'value': '50+', 'label': 'Projects delivered'},
                         {'value': '8',   'label': 'Years of experience'},
                         {'value': '100%','label': 'Clients with dedicated advisor'},
                         {'value': '24h', 'label': 'Response time'},
                     ], ensure_ascii=False)},
                ],
            },
            {
                'key': 'values', 'label': 'Valores', 'order': 4,
                'blocks': [
                    {'key': 'eyebrow', 'label': 'Eyebrow', 'type': 'text', 'es': 'Nuestros valores',            'en': 'Our values'},
                    {'key': 'title',   'label': 'Título',  'type': 'text', 'es': 'Lo que nos define en cada proyecto', 'en': 'What defines us in every project'},
                    {'key': 'items',   'label': 'Valores (JSON)', 'type': 'json',
                     'es': json.dumps([
                         {'number': '01', 'title': 'Transparencia total',          'description': 'Presupuestos detallados ítem por ítem antes de iniciar. Sin cargos ocultos, sin sorpresas al final.'},
                         {'number': '02', 'title': 'Cronogramas que se cumplen',   'description': 'Planificamos con margen y ejecutamos con disciplina. Cada semana de retraso tiene un costo real para el cliente — lo sabemos y actuamos en consecuencia.'},
                         {'number': '03', 'title': 'Calidad verificable',          'description': 'Materiales de primera línea, maestros de obra certificados y supervisión diaria. El resultado habla por sí solo.'},
                         {'number': '04', 'title': 'Un asesor, un proyecto',       'description': 'Cada cliente tiene un punto de contacto único durante todo el proceso. Sin transferencias, sin malentendidos.'},
                     ], ensure_ascii=False),
                     'en': json.dumps([
                         {'number': '01', 'title': 'Full transparency',        'description': 'Detailed line-item budgets before we start. No hidden charges, no surprises at the end.'},
                         {'number': '02', 'title': 'Schedules that are met',   'description': 'We plan with margin and execute with discipline. Every week of delay has a real cost for the client — we know it and act accordingly.'},
                         {'number': '03', 'title': 'Verifiable quality',       'description': 'First-line materials, certified foremen and daily supervision. The result speaks for itself.'},
                         {'number': '04', 'title': 'One advisor, one project', 'description': 'Each client has a single point of contact throughout the entire process. No transfers, no misunderstandings.'},
                     ], ensure_ascii=False)},
                ],
            },
            {
                'key': 'differentiators', 'label': 'Diferenciadores', 'order': 5,
                'blocks': [
                    {'key': 'eyebrow', 'label': 'Eyebrow', 'type': 'text', 'es': 'Por qué elegirnos',       'en': 'Why choose us'},
                    {'key': 'title',   'label': 'Título',  'type': 'text', 'es': 'Lo que nos hace distintos', 'en': 'What makes us different'},
                    {'key': 'items',   'label': 'Lista de diferenciadores (JSON)', 'type': 'json',
                     'es': json.dumps([
                         'Presupuesto gratuito y detallado en 48 horas',
                         'Portal de cliente con fotos y avance en tiempo real',
                         'Garantía mínima de 1 año en mano de obra',
                         'Equipo técnico especializado por tipo de proyecto',
                         'Contratos claros con orden de cambios documentada',
                         'Más de 50 proyectos entregados sin litigios',
                     ], ensure_ascii=False),
                     'en': json.dumps([
                         'Free detailed estimate within 48 hours',
                         'Client portal with real-time photos and progress',
                         'Minimum 1-year labor warranty',
                         'Specialized technical team per project type',
                         'Clear contracts with documented change orders',
                         'Over 50 projects delivered without litigation',
                     ], ensure_ascii=False)},
                ],
            },
            {
                'key': 'mini_cta', 'label': 'CTA pequeño', 'order': 6,
                'blocks': [
                    {'key': 'title',          'label': 'Título',            'type': 'text', 'es': '¿Listo para iniciar tu proyecto?',                                      'en': 'Ready to start your project?'},
                    {'key': 'subtitle',       'label': 'Subtítulo',         'type': 'text', 'es': 'Cuéntanos tu idea y te entregamos una cotización sin costo en 24 horas.', 'en': 'Tell us your idea and we\'ll deliver a free estimate within 24 hours.'},
                    {'key': 'button_primary', 'label': 'Botón principal',   'type': 'text', 'es': 'Solicitar cotización gratuita',                                          'en': 'Request a free estimate'},
                    {'key': 'button_secondary','label': 'Botón secundario', 'type': 'text', 'es': 'Ver proyectos',                                                          'en': 'View projects'},
                ],
            },
        ],
    },

    # ── CONTACT ───────────────────────────────────────────────────────────────
    {
        'slug': 'contact',
        'title_es': 'Contacto',
        'title_en': 'Contact',
        'meta_description_es': 'Contáctanos para una cotización gratuita. Respondemos en menos de 24 horas.',
        'meta_description_en': 'Contact us for a free estimate. We respond within 24 hours.',
        'sections': [
            {
                'key': 'hero', 'label': 'Hero', 'order': 1,
                'blocks': [
                    {'key': 'eyebrow',  'label': 'Eyebrow',  'type': 'text', 'es': 'Contacto',                                                                                         'en': 'Contact'},
                    {'key': 'title',    'label': 'Título',   'type': 'text', 'es': 'Hablemos de tu proyecto',                                                                          'en': "Let's talk about your project"},
                    {'key': 'subtitle', 'label': 'Subtítulo','type': 'text', 'es': 'Cuéntanos qué tienes en mente. Sin compromiso, sin costo — solo una conversación para entender tu visión.', 'en': 'Tell us what you have in mind. No obligation, no cost — just a conversation to understand your vision.'},
                ],
            },
            {
                'key': 'info', 'label': 'Información de contacto', 'order': 2,
                'blocks': [
                    {'key': 'location',     'label': 'Dirección',       'type': 'text', 'es': 'Ciudad de Guatemala, Guatemala', 'en': 'Guatemala City, Guatemala'},
                    {'key': 'phone',        'label': 'Teléfono',        'type': 'text', 'es': '+502 2000-0000',                  'en': '+502 2000-0000'},
                    {'key': 'email',        'label': 'Email',           'type': 'text', 'es': 'info@grucore.gt',                 'en': 'info@grucore.gt'},
                    {'key': 'hours',        'label': 'Horario',         'type': 'text', 'es': 'Lun – Vie, 8:00 – 18:00',        'en': 'Mon – Fri, 8:00 – 18:00'},
                    {'key': 'whatsapp_cta', 'label': 'CTA WhatsApp',   'type': 'text', 'es': 'Escribir por WhatsApp ahora',     'en': 'Write on WhatsApp now'},
                    {'key': 'maps_url',     'label': 'URL Google Maps', 'type': 'text', 'es': '',                                  'en': ''},
                ],
            },
            {
                'key': 'form', 'label': 'Formulario de contacto', 'order': 3,
                'blocks': [
                    {'key': 'field_name',        'label': 'Campo — Nombre',         'type': 'text', 'es': 'Nombre completo',           'en': 'Full name'},
                    {'key': 'field_email',        'label': 'Campo — Email',          'type': 'text', 'es': 'Correo electrónico',         'en': 'Email address'},
                    {'key': 'field_phone',        'label': 'Campo — Teléfono',       'type': 'text', 'es': 'Teléfono / WhatsApp',        'en': 'Phone / WhatsApp'},
                    {'key': 'field_type',         'label': 'Campo — Tipo proyecto',  'type': 'text', 'es': 'Tipo de proyecto',           'en': 'Project type'},
                    {'key': 'field_message',      'label': 'Campo — Mensaje',        'type': 'text', 'es': 'Cuéntanos tu proyecto',      'en': 'Tell us about your project'},
                    {'key': 'field_message_ph',   'label': 'Placeholder — Mensaje',  'type': 'text', 'es': 'Describe brevemente qué quieres construir o remodelar, el área aproximada y la ubicación...', 'en': 'Briefly describe what you want to build or remodel, approximate area and location...'},
                    {'key': 'btn_submit',         'label': 'Botón enviar',           'type': 'text', 'es': 'Enviar mensaje',             'en': 'Send message'},
                    {'key': 'btn_submitting',     'label': 'Botón enviando…',        'type': 'text', 'es': 'Enviando…',                  'en': 'Sending…'},
                    {'key': 'footer_trust',       'label': 'Pie de formulario',      'type': 'text', 'es': 'Sin costo · Sin compromiso · Respuesta en menos de 24 h', 'en': 'No cost · No obligation · Response within 24 h'},
                    {'key': 'project_types',      'label': 'Tipos de proyecto (JSON)', 'type': 'json',
                     'es': json.dumps(['Construcción residencial','Remodelación','Proyecto comercial','Diseño y construcción','Industrial','Acabados','Otro'], ensure_ascii=False),
                     'en': json.dumps(['Residential construction','Remodeling','Commercial project','Design & build','Industrial','Finishing','Other'], ensure_ascii=False)},
                ],
            },
            {
                'key': 'form_states', 'label': 'Estados del formulario', 'order': 4,
                'blocks': [
                    {'key': 'success_title', 'label': 'Éxito — Título',        'type': 'text', 'es': '¡Mensaje recibido!',                                         'en': 'Message received!'},
                    {'key': 'success_body',  'label': 'Éxito — Cuerpo',        'type': 'text', 'es': 'Nuestro equipo se pondrá en contacto contigo en menos de 24 horas.', 'en': 'Our team will get back to you within 24 hours.'},
                    {'key': 'error_title',   'label': 'Error — Título',         'type': 'text', 'es': 'Error al enviar',                                           'en': 'Failed to send'},
                    {'key': 'error_body',    'label': 'Error — Cuerpo',         'type': 'text', 'es': 'Intenta de nuevo o escríbenos directamente por WhatsApp.',   'en': 'Please try again or write to us directly on WhatsApp.'},
                    {'key': 'retry_button',  'label': 'Botón reintentar',       'type': 'text', 'es': 'Intentar de nuevo',                                         'en': 'Try again'},
                ],
            },
        ],
    },

    # ── SERVICES ──────────────────────────────────────────────────────────────
    {
        'slug': 'services',
        'title_es': 'Servicios',
        'title_en': 'Services',
        'meta_description_es': 'Construcción residencial, remodelación, proyectos comerciales e industriales en Guatemala.',
        'meta_description_en': 'Residential construction, remodeling, commercial and industrial projects in Guatemala.',
        'sections': [
            {
                'key': 'hero', 'label': 'Hero', 'order': 1,
                'blocks': [
                    {'key': 'eyebrow',  'label': 'Eyebrow',  'type': 'text', 'es': 'Nuestros servicios',                                                                                                                                                              'en': 'Our services'},
                    {'key': 'title',    'label': 'Título',   'type': 'text', 'es': 'Soluciones para cada tipo de proyecto',                                                                                                                                           'en': 'Solutions for every project type'},
                    {'key': 'subtitle', 'label': 'Subtítulo','type': 'text', 'es': 'Cada proyecto es único. Trabajamos con un equipo técnico especializado por tipo de obra, con cronogramas claros y presupuestos detallados desde el primer día.',                  'en': 'Every project is unique. We work with a specialized technical team per project type, with clear schedules and detailed budgets from day one.'},
                ],
            },
            {
                'key': 'labels', 'label': 'Etiquetas de tarjetas', 'order': 2,
                'blocks': [
                    {'key': 'cta_quote',  'label': 'CTA — Cotizar',      'type': 'text', 'es': 'Solicitar cotización gratuita', 'en': 'Request a free estimate'},
                    {'key': 'cta_detail', 'label': 'CTA — Ver detalle',  'type': 'text', 'es': 'Ver detalle del servicio',      'en': 'View service details'},
                ],
            },
            {
                'key': 'faq', 'label': 'Preguntas frecuentes', 'order': 3,
                'blocks': [
                    {'key': 'title', 'label': 'Título sección FAQ', 'type': 'text', 'es': 'Preguntas frecuentes', 'en': 'Frequently asked questions'},
                    {'key': 'items', 'label': 'Preguntas (JSON)', 'type': 'json',
                     'es': json.dumps([
                         {'q': '¿El presupuesto es realmente gratuito?', 'a': 'Sí. La evaluación del proyecto, la visita técnica y el presupuesto detallado no tienen costo ni compromiso.'},
                         {'q': '¿Cuánto tarda el proceso antes de iniciar obra?', 'a': 'Entre 2 y 4 semanas desde la aprobación del presupuesto, dependiendo de la disponibilidad de materiales y permisos.'},
                         {'q': '¿Qué pasa si el costo varía durante la obra?', 'a': 'Cualquier variación se documenta mediante orden de cambio firmada por ambas partes antes de ejecutarse. Sin sorpresas.'},
                         {'q': '¿Tienen garantía los trabajos?', 'a': 'Sí. Todos los proyectos tienen garantía mínima de 1 año en mano de obra. Los proyectos mayores tienen garantía extendida según contrato.'},
                     ], ensure_ascii=False),
                     'en': json.dumps([
                         {'q': 'Is the estimate really free?', 'a': 'Yes. The project evaluation, technical visit and detailed estimate are free with no obligation.'},
                         {'q': 'How long before construction starts?', 'a': 'Between 2 and 4 weeks from budget approval, depending on material availability and permits.'},
                         {'q': 'What if costs change during construction?', 'a': 'Any variation is documented via a change order signed by both parties before execution. No surprises.'},
                         {'q': 'Is the work guaranteed?', 'a': 'Yes. All projects carry a minimum 1-year labor warranty. Larger projects have extended warranty per contract.'},
                     ], ensure_ascii=False)},
                ],
            },
        ],
    },

    # ── PROJECTS ──────────────────────────────────────────────────────────────
    {
        'slug': 'projects',
        'title_es': 'Proyectos',
        'title_en': 'Projects',
        'meta_description_es': 'Más de 50 proyectos ejecutados en Guatemala. Construcción residencial, comercial e industrial.',
        'meta_description_en': 'Over 50 projects completed in Guatemala. Residential, commercial and industrial construction.',
        'sections': [
            {
                'key': 'hero', 'label': 'Hero', 'order': 1,
                'blocks': [
                    {'key': 'eyebrow',  'label': 'Eyebrow',  'type': 'text', 'es': 'Portafolio',                                                                                                                        'en': 'Portfolio'},
                    {'key': 'title',    'label': 'Título',   'type': 'text', 'es': 'Proyectos que hablan por sí solos',                                                                                                 'en': 'Projects that speak for themselves'},
                    {'key': 'subtitle', 'label': 'Subtítulo','type': 'text', 'es': 'Más de 50 proyectos ejecutados en Guatemala. Cada uno con cronograma cumplido, presupuesto respetado y cliente satisfecho.',        'en': 'Over 50 projects completed in Guatemala. Each one with schedule met, budget respected and client satisfied.'},
                ],
            },
            {
                'key': 'labels', 'label': 'Etiquetas de tarjetas', 'order': 2,
                'blocks': [
                    {'key': 'area_unit',    'label': 'Unidad de área',     'type': 'text', 'es': 'm² construidos',       'en': 'sq meters built'},
                    {'key': 'duration',     'label': 'Duración',           'type': 'text', 'es': 'duración',             'en': 'duration'},
                    {'key': 'months',       'label': 'Meses',              'type': 'text', 'es': 'meses',                'en': 'months'},
                    {'key': 'year',         'label': 'Año',                'type': 'text', 'es': 'Año',                  'en': 'Year'},
                    {'key': 'view_project', 'label': 'Ver proyecto',       'type': 'text', 'es': 'Ver proyecto',         'en': 'View project'},
                    {'key': 'empty_state',  'label': 'Estado vacío',       'type': 'text', 'es': 'No hay proyectos en esta categoría.', 'en': 'No projects in this category.'},
                ],
            },
        ],
    },

    # ── GLOBAL ────────────────────────────────────────────────────────────────
    {
        'slug': 'global',
        'title_es': 'Global — Navegación y etiquetas comunes',
        'title_en': 'Global — Navigation and common labels',
        'meta_description_es': '',
        'meta_description_en': '',
        'sections': [
            {
                'key': 'navigation', 'label': 'Navegación principal', 'order': 1,
                'blocks': [
                    {'key': 'services', 'label': 'Nav — Servicios', 'type': 'text', 'es': 'Servicios',      'en': 'Services'},
                    {'key': 'projects', 'label': 'Nav — Proyectos', 'type': 'text', 'es': 'Proyectos',      'en': 'Projects'},
                    {'key': 'about',    'label': 'Nav — Nosotros',  'type': 'text', 'es': 'Nosotros',       'en': 'About'},
                    {'key': 'contact',  'label': 'Nav — Contacto',  'type': 'text', 'es': 'Contacto',       'en': 'Contact'},
                    {'key': 'quote',    'label': 'Nav — Cotizar',   'type': 'text', 'es': 'Cotizar',        'en': 'Get a quote'},
                    {'key': 'portal',   'label': 'Nav — Portal',    'type': 'text', 'es': 'Portal cliente', 'en': 'Client portal'},
                ],
            },
            {
                'key': 'metadata', 'label': 'Metadatos globales del sitio', 'order': 2,
                'blocks': [
                    {'key': 'site_title',       'label': 'Título del sitio',      'type': 'text', 'es': 'Grucore — Construcción y Remodelación en Guatemala', 'en': 'Grucore — Premium Construction Guatemala'},
                    {'key': 'site_description', 'label': 'Descripción del sitio', 'type': 'text', 'es': 'Empresa de construcción y remodelación premium en Guatemala. Proyectos residenciales y comerciales con los más altos estándares de calidad.', 'en': 'Premium construction and remodeling company in Guatemala. Residential and commercial projects with the highest quality standards.'},
                ],
            },
            {
                'key': 'common', 'label': 'Etiquetas comunes de UI', 'order': 3,
                'blocks': [
                    {'key': 'loading',   'label': 'Cargando',  'type': 'text', 'es': 'Cargando...',        'en': 'Loading...'},
                    {'key': 'error',     'label': 'Error',     'type': 'text', 'es': 'Ha ocurrido un error','en': 'An error occurred'},
                    {'key': 'retry',     'label': 'Reintentar','type': 'text', 'es': 'Reintentar',          'en': 'Retry'},
                    {'key': 'save',      'label': 'Guardar',   'type': 'text', 'es': 'Guardar',             'en': 'Save'},
                    {'key': 'cancel',    'label': 'Cancelar',  'type': 'text', 'es': 'Cancelar',            'en': 'Cancel'},
                    {'key': 'back',      'label': 'Volver',    'type': 'text', 'es': 'Volver',              'en': 'Back'},
                    {'key': 'search',    'label': 'Buscar',    'type': 'text', 'es': 'Buscar',              'en': 'Search'},
                    {'key': 'filter',    'label': 'Filtrar',   'type': 'text', 'es': 'Filtrar',             'en': 'Filter'},
                ],
            },
        ],
    },
]


class Command(BaseCommand):
    help = 'Carga el contenido inicial del CMS (idempotente)'

    def handle(self, *args, **options):
        created_pages = 0
        updated_pages = 0
        created_blocks = 0

        for page_data in PAGES:
            sections_data = page_data.pop('sections')
            page, page_created = Page.objects.update_or_create(
                slug=page_data['slug'],
                defaults=page_data,
            )
            if page_created:
                created_pages += 1
            else:
                updated_pages += 1

            for section_data in sections_data:
                blocks_data = section_data.pop('blocks')
                section, _ = Section.objects.update_or_create(
                    page=page,
                    key=section_data['key'],
                    defaults={
                        'label':      section_data['label'],
                        'order':      section_data['order'],
                        'is_visible': section_data.get('is_visible', True),
                    },
                )

                for i, block_data in enumerate(blocks_data):
                    _, block_created = Block.objects.update_or_create(
                        section=section,
                        key=block_data['key'],
                        defaults={
                            'label':      block_data['label'],
                            'block_type': block_data['type'],
                            'value_es':   block_data['es'],
                            'value_en':   block_data['en'],
                            'order':      i,
                        },
                    )
                    if block_created:
                        created_blocks += 1

        self.stdout.write(self.style.SUCCESS(
            f'✓ CMS cargado — {created_pages} páginas nuevas, {updated_pages} actualizadas, {created_blocks} bloques creados.'
        ))
