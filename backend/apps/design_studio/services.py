"""
Design Studio — AI provider strategy.

Adding a new model:
  1. Create a class inheriting BaseImageProvider and implement generate().
  2. Add it to the PROVIDERS registry with a unique key.
  3. Add the key to ModelKey choices in models.py.
"""

from __future__ import annotations

import uuid
import requests
from abc import ABC, abstractmethod
from pathlib import Path

from django.conf import settings

from .models import DesignSession, ArchStyle, ProjectType, SessionType


# ─── Prompt engineering ───────────────────────────────────────────────────────

_STYLE_MAP = {
    ArchStyle.MODERN:        'modern architecture, clean geometric lines, large floor-to-ceiling windows, flat roof, minimalist facade',
    ArchStyle.MINIMALIST:    'minimalist architecture, simple pure forms, neutral white palette, open airy spaces, no ornament',
    ArchStyle.MEDITERRANEAN: 'mediterranean architecture, warm terracotta tiles, arched windows and doorways, whitewashed stucco, courtyard with greenery',
    ArchStyle.INDUSTRIAL:    'industrial style architecture, exposed concrete walls, structural steel, brick accents, large metal windows',
    ArchStyle.RUSTIC:        'rustic architecture, natural stone facade, hand-hewn wood beams, warm earth tones, traditional craftsmanship',
    ArchStyle.CONTEMPORARY:  'contemporary architecture, dynamic forms, mix of glass and premium stone cladding, dramatic cantilevers',
    ArchStyle.COLONIAL:      'colonial classic architecture, symmetrical facade, ornate columns, arched portico, terracotta roof tiles',
}

_PROJECT_TYPE_MAP = {
    ProjectType.HOUSE:      'single-family residential house',
    ProjectType.APARTMENT:  'multi-story apartment building',
    ProjectType.COMMERCIAL: 'commercial retail building',
    ProjectType.OFFICE:     'modern office building',
    ProjectType.OTHER:      'building',
}

_QUALITY_SUFFIX = (
    'architectural visualization, photorealistic CGI render, 8K resolution, '
    'golden hour lighting, professional photography, highly detailed, sharp focus, '
    'no people, award-winning architecture'
)

_REMODEL_QUALITY_SUFFIX = (
    'interior design visualization, photorealistic render, 8K resolution, '
    'professional interior photography, natural light, highly detailed, '
    'after renovation, premium finish'
)


def build_prompt(session: DesignSession) -> str:
    """Assemble a prompt from session parameters."""
    style       = _STYLE_MAP.get(session.style, session.style)
    proj_type   = _PROJECT_TYPE_MAP.get(session.project_type, session.project_type)
    floors_hint = f', {session.floors}-story' if session.floors else ''
    extra       = f', {session.extra_description.strip()}' if session.extra_description.strip() else ''

    if session.session_type == SessionType.NEW_CONSTRUCTION:
        prompt = (
            f'{style}{floors_hint} {proj_type}{extra}, '
            f'exterior view, landscaped surroundings, {_QUALITY_SUFFIX}'
        )
    else:
        prompt = (
            f'{style} interior renovation of a {proj_type}{extra}, '
            f'complete remodel, modern finishes, {_REMODEL_QUALITY_SUFFIX}'
        )

    return prompt


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _save_image_bytes(data: bytes, ext: str = 'jpg') -> str:
    """Save raw bytes to MEDIA_ROOT/design_studio/renders/ and return relative path."""
    save_dir = Path(settings.MEDIA_ROOT) / 'design_studio' / 'renders'
    save_dir.mkdir(parents=True, exist_ok=True)
    filename = f'{uuid.uuid4()}.{ext}'
    (save_dir / filename).write_bytes(data)
    return f'design_studio/renders/{filename}'


def _download_and_save(url: str) -> str:
    """Download an image from a URL, save it, and return the relative path."""
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    content_type = resp.headers.get('Content-Type', 'image/jpeg')
    ext = 'png' if 'png' in content_type else 'jpg'
    return _save_image_bytes(resp.content, ext)


# ─── Base provider ────────────────────────────────────────────────────────────

class BaseImageProvider(ABC):
    @abstractmethod
    def generate(self, prompt: str, n: int = 3) -> list[str]:
        """Return a list of n relative media paths to generated images."""


# ─── HuggingFace — FLUX.1-schnell (Free) ─────────────────────────────────────

class HuggingFaceFluxSchnellProvider(BaseImageProvider):
    """
    Free tier via HuggingFace Inference API.
    Requires: HUGGINGFACE_API_TOKEN in settings.
    """
    _API_URL = 'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell'

    def generate(self, prompt: str, n: int = 3) -> list[str]:
        token = getattr(settings, 'HUGGINGFACE_API_TOKEN', '')
        if not token:
            raise ValueError('HUGGINGFACE_API_TOKEN no está configurado en .env')

        headers = {'Authorization': f'Bearer {token}'}
        paths = []

        for _ in range(n):
            resp = requests.post(
                self._API_URL,
                headers=headers,
                json={'inputs': prompt},
                timeout=90,
            )
            # HF returns 503 while model loads — surface a clear error
            if resp.status_code == 503:
                raise RuntimeError('El modelo está cargando en HuggingFace, intenta en ~30 segundos.')
            resp.raise_for_status()
            paths.append(_save_image_bytes(resp.content, 'jpg'))

        return paths


# ─── OpenAI — DALL·E 3 ────────────────────────────────────────────────────────

class OpenAIDallE3Provider(BaseImageProvider):
    """
    DALL·E 3 via OpenAI API.
    Requires: OPENAI_API_KEY in settings.
    Note: DALL·E 3 generates 1 image per request; loops n times.
    """

    def generate(self, prompt: str, n: int = 3) -> list[str]:
        try:
            import openai
        except ImportError:
            raise RuntimeError('Instala openai: pip install openai')

        api_key = getattr(settings, 'OPENAI_API_KEY', '')
        if not api_key:
            raise ValueError('OPENAI_API_KEY no está configurado en .env')

        client = openai.OpenAI(api_key=api_key)
        paths  = []

        for _ in range(n):
            response = client.images.generate(
                model='dall-e-3',
                prompt=prompt,
                size='1024x1024',
                quality='standard',
                n=1,
            )
            image_url = response.data[0].url
            paths.append(_download_and_save(image_url))

        return paths


# ─── fal.ai — FLUX.1-pro (Production) ────────────────────────────────────────

class FalFluxProProvider(BaseImageProvider):
    """
    FLUX.1-pro via fal.ai — production-quality architectural renders.
    Requires: FAL_API_KEY in settings.
    Stub: configure FAL_API_KEY and uncomment the implementation.
    """

    def generate(self, prompt: str, n: int = 3) -> list[str]:
        raise NotImplementedError(
            'fal.ai provider no está implementado aún. '
            'Configura FAL_API_KEY en .env para activarlo.'
        )


# ─── Registry ─────────────────────────────────────────────────────────────────

PROVIDERS: dict[str, type[BaseImageProvider]] = {
    'flux_schnell_hf': HuggingFaceFluxSchnellProvider,
    'dalle3_openai':   OpenAIDallE3Provider,
    'flux_pro_fal':    FalFluxProProvider,
}


def get_provider(model_key: str) -> BaseImageProvider:
    cls = PROVIDERS.get(model_key)
    if cls is None:
        raise ValueError(f'Modelo desconocido: {model_key}')
    return cls()
