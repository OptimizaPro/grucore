import logging
import threading
import requests
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

logger = logging.getLogger(__name__)


def _call_revalidate(type_: str) -> None:
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
    secret = getattr(settings, 'REVALIDATE_SECRET', '')
    if not secret:
        return
    url = f'{frontend_url}/api/cms/revalidate?secret={secret}&type={type_}'
    try:
        resp = requests.post(url, timeout=5)
        if resp.ok:
            logger.info('Revalidated: type=%s', type_)
        else:
            logger.warning('Revalidate failed: type=%s status=%s', type_, resp.status_code)
    except Exception as exc:
        logger.warning('Revalidate error: type=%s error=%s', type_, exc)


@receiver(post_save, sender='core.CompanySettings')
def on_company_settings_save(sender, instance, **kwargs):
    threading.Thread(target=_call_revalidate, args=('settings',), daemon=True).start()
