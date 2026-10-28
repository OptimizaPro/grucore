"""
python manage.py seed_cotizar

Carga el contenido editable de la página /cotizar en el CMS.
Idempotente: si ya existe el contenido, lo actualiza; si no, lo crea.
"""
from django.core.management.base import BaseCommand
from apps.cms.models import Page, Section, Block


PAGES = [
    {
        'slug': 'cotizar',
        'title_es': 'Cotizar — Cuestionario',
        'title_en': 'Quote — Quiz',
        'meta_description_es': 'Cuéntanos tu proyecto y recibe una propuesta personalizada sin costo.',
        'meta_description_en': 'Tell us about your project and receive a personalized proposal at no cost.',
        'sections': [
            {
                'key': 'panel', 'label': 'Panel izquierdo', 'order': 1,
                'blocks': [
                    {'key': 'eyebrow',       'label': 'Eyebrow',              'type': 'text', 'es': 'Calificación de proyecto',                                                                                          'en': 'Project qualification'},
                    {'key': 'headline',      'label': 'Titular',              'type': 'text', 'es': 'Cuéntanos tu proyecto',                                                                                             'en': 'Tell us about your project'},
                    {'key': 'description',   'label': 'Descripción',          'type': 'text', 'es': 'En menos de 2 minutos sabremos si somos la empresa ideal para hacerlo realidad y te haremos una propuesta personalizada.', 'en': 'In less than 2 minutes we will know if we are the ideal company to make it happen and will send you a personalized proposal.'},
                    {'key': 'benefit_1',     'label': 'Beneficio 1',          'type': 'text', 'es': 'Propuesta sin costo ni compromiso',     'en': 'Proposal at no cost or obligation'},
                    {'key': 'benefit_2',     'label': 'Beneficio 2',          'type': 'text', 'es': 'Respuesta en menos de 24 horas',        'en': 'Response within 24 hours'},
                    {'key': 'benefit_3',     'label': 'Beneficio 3',          'type': 'text', 'es': 'Asesoría de especialistas certificados', 'en': 'Advice from certified specialists'},
                    {'key': 'stat_1_value',  'label': 'Estadística 1 — Valor','type': 'text', 'es': '10+',                                   'en': '10+'},
                    {'key': 'stat_1_label',  'label': 'Estadística 1 — Label','type': 'text', 'es': 'Años de\nexperiencia',                  'en': 'Years of\nexperience'},
                    {'key': 'stat_2_value',  'label': 'Estadística 2 — Valor','type': 'text', 'es': '50+',                                   'en': '50+'},
                    {'key': 'stat_2_label',  'label': 'Estadística 2 — Label','type': 'text', 'es': 'Proyectos\nentregados',                 'en': 'Projects\ndelivered'},
                    {'key': 'stat_3_value',  'label': 'Estadística 3 — Valor','type': 'text', 'es': '5★',                                   'en': '5★'},
                    {'key': 'stat_3_label',  'label': 'Estadística 3 — Label','type': 'text', 'es': 'Calificación\nGoogle',                  'en': 'Google\nrating'},
                    {'key': 'tagline',       'label': 'Tagline inferior',     'type': 'text', 'es': 'Guatemala · Construcción & Remodelación', 'en': 'Guatemala · Construction & Remodeling'},
                ],
            },
            {
                'key': 'questions', 'label': 'Preguntas del quiz', 'order': 2,
                'blocks': [
                    {'key': 'q1',      'label': 'Pregunta 1',          'type': 'text', 'es': '¿Qué tipo de proyecto tienes en mente?',      'en': 'What type of project do you have in mind?'},
                    {'key': 'q2',      'label': 'Pregunta 2',          'type': 'text', 'es': '¿En qué etapa te encuentras?',                'en': 'What stage are you at?'},
                    {'key': 'q3',      'label': 'Pregunta 3',          'type': 'text', 'es': '¿Cuándo te gustaría iniciar el proyecto?',    'en': 'When would you like to start the project?'},
                    {'key': 'q4',      'label': 'Pregunta 4',          'type': 'text', 'es': '¿Cuál es tu presupuesto aproximado?',         'en': "What's your approximate budget?"},
                    {'key': 'q4_note', 'label': 'Pregunta 4 — Nota',  'type': 'text', 'es': 'En quetzales guatemaltecos (GTQ)',             'en': 'In Guatemalan quetzales (GTQ)'},
                    {'key': 'q5',      'label': 'Pregunta 5',          'type': 'text', 'es': '¿Cómo financiarías el proyecto?',             'en': 'How would you finance the project?'},
                ],
            },
            {
                'key': 'contact_step', 'label': 'Paso de contacto', 'order': 3,
                'blocks': [
                    {'key': 'eyebrow',      'label': 'Eyebrow',      'type': 'text', 'es': 'Último paso',                                                                        'en': 'Last step'},
                    {'key': 'title',        'label': 'Título',        'type': 'text', 'es': '¿Cómo podemos contactarte?',                                                        'en': 'How can we reach you?'},
                    {'key': 'description',  'label': 'Descripción',  'type': 'text', 'es': 'Un especialista revisará tu perfil y te contactará con una propuesta personalizada.', 'en': 'A specialist will review your profile and contact you with a personalized proposal.'},
                    {'key': 'submit_label', 'label': 'Botón enviar', 'type': 'text', 'es': 'Ver mi resultado',                                                                   'en': 'See my result'},
                ],
            },
            {
                'key': 'result', 'label': 'Paso de resultado', 'order': 4,
                'blocks': [
                    {'key': 'loading',              'label': 'Mensaje cargando',     'type': 'text', 'es': 'Analizando tu perfil…',              'en': 'Analyzing your profile…'},
                    {'key': 'classification_label', 'label': 'Etiqueta clasificación','type': 'text', 'es': 'Clasificación de tu proyecto',      'en': 'Your project classification'},
                    {'key': 'cta_projects',         'label': 'CTA — Ver proyectos',  'type': 'text', 'es': 'Ver proyectos',                      'en': 'View projects'},
                    {'key': 'cta_whatsapp',         'label': 'CTA — WhatsApp',       'type': 'text', 'es': 'Enviar por WhatsApp',                'en': 'Send via WhatsApp'},
                    {'key': 'wa_intro',             'label': 'Introducción WhatsApp','type': 'text', 'es': 'Hola, respondí el cuestionario en grucore.com.', 'en': 'Hello, I completed the quiz at grucore.com.'},
                ],
            },
        ],
    },
]


class Command(BaseCommand):
    help = 'Carga el contenido editable de /cotizar en el CMS (idempotente)'

    def handle(self, *args, **options):
        created_pages  = 0
        updated_pages  = 0
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
            f'✓ CMS cotizar cargado — {created_pages} páginas nuevas, {updated_pages} actualizadas, {created_blocks} bloques creados.'
        ))
