from celery import shared_task

from .models import DesignSession, SessionStatus
from .services import get_provider, build_prompt


@shared_task(bind=True, max_retries=1, default_retry_delay=15)
def generate_renders_task(self, session_id: int) -> None:
    """
    Celery task: build prompt → call AI provider → save render paths → update session.
    The frontend polls GET /api/design-studio/sessions/{id}/ until status='completed'.
    """
    try:
        session = DesignSession.objects.get(pk=session_id)
    except DesignSession.DoesNotExist:
        return

    session.status = SessionStatus.GENERATING
    session.save(update_fields=['status'])

    try:
        provider     = get_provider(session.model_key)
        prompt       = build_prompt(session)
        render_paths = provider.generate(prompt, n=3)

        session.renders     = render_paths
        session.prompt_used = prompt
        session.status      = SessionStatus.COMPLETED
        session.save(update_fields=['renders', 'prompt_used', 'status', 'updated_at'])

    except Exception as exc:
        session.status        = SessionStatus.FAILED
        session.error_message = str(exc)
        session.save(update_fields=['status', 'error_message', 'updated_at'])
        raise self.retry(exc=exc)
