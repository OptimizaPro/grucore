"""
Llama al endpoint de revalidación de Next.js cuando se guarda una página,
sección o bloque del CMS. Así los cambios en el admin se reflejan de inmediato.
"""
import logging
import threading

import requests
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

logger = logging.getLogger(__name__)


def _call_revalidate(slug: str) -> None:
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
    secret       = getattr(settings, 'REVALIDATE_SECRET', '')
    if not secret:
        return

    url = f'{frontend_url}/api/cms/revalidate?secret={secret}&slug={slug}'
    try:
        resp = requests.post(url, timeout=5)
        if resp.ok:
            logger.info('CMS revalidated: slug=%s paths=%s', slug, resp.json().get('paths'))
        else:
            logger.warning('CMS revalidate failed: slug=%s status=%s', slug, resp.status_code)
    except Exception as exc:
        logger.warning('CMS revalidate error: slug=%s error=%s', slug, exc)


def _revalidate_async(slug: str) -> None:
    """Fire-and-forget para no bloquear el request del admin."""
    threading.Thread(target=_call_revalidate, args=(slug,), daemon=True).start()


@receiver(post_save, sender='cms.Page')
def on_page_save(sender, instance, **kwargs):
    _revalidate_async(instance.slug)


@receiver(post_save, sender='cms.Section')
def on_section_save(sender, instance, **kwargs):
    _revalidate_async(instance.page.slug)


@receiver(post_save, sender='cms.Block')
def on_block_save(sender, instance, **kwargs):
    _revalidate_async(instance.section.page.slug)


@receiver(post_save, sender='cms.MarqueeItem')
def on_marquee_save(sender, instance, **kwargs):
    _revalidate_async('global')
