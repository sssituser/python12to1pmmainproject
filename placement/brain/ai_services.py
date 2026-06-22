"""
brain/ai_services.py
Central AI service router — tries Google Gemini (online) first,
falls back to local offline algorithms automatically.
Uses the new google-genai SDK (google.genai).
"""

import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

GEMINI_API_KEY: Optional[str] = os.environ.get("GEMINI_API_KEY", "").strip()
_client = None
_gemini_available: Optional[bool] = None
_MODEL = "gemini-2.0-flash"
_EMBED_MODEL = "text-embedding-004"


def _init_gemini() -> bool:
    """Try to initialise the Gemini client once; cache the result."""
    global _client, _gemini_available
    if _gemini_available is not None:
        return _gemini_available
    if not GEMINI_API_KEY:
        logger.info("GEMINI_API_KEY not set — using offline AI engine.")
        _gemini_available = False
        return False
    try:
        from google import genai  # type: ignore
        _client = genai.Client(api_key=GEMINI_API_KEY)
        # Quick connectivity probe
        _client.models.generate_content(
            model=_MODEL,
            contents="ping",
        )
        _gemini_available = True
        logger.info(f"Gemini API initialised (model={_MODEL}).")
    except Exception as exc:
        logger.warning(f"Gemini not available ({exc}). Falling back to offline engine.")
        _gemini_available = False
    return _gemini_available


def is_online() -> bool:
    """Return True if Gemini is available and reachable."""
    return _init_gemini()


def gemini_generate(prompt: str, max_tokens: int = 2048) -> Optional[str]:
    """
    Call Gemini and return the response text, or None on failure.
    """
    if not is_online():
        return None
    try:
        from google import genai  # type: ignore
        from google.genai import types  # type: ignore
        response = _client.models.generate_content(
            model=_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                max_output_tokens=max_tokens,
                temperature=0.4,
            ),
        )
        return response.text.strip()
    except Exception as exc:
        logger.error(f"Gemini generate error: {exc}")
        return None


def gemini_embed(text: str) -> Optional[list]:
    """
    Generate an embedding vector for *text* using Gemini.
    Returns a list of floats, or None on failure.
    """
    if not is_online():
        return None
    try:
        from google import genai  # type: ignore
        result = _client.models.embed_content(
            model=_EMBED_MODEL,
            contents=text,
        )
        # result.embeddings is a list of ContentEmbedding objects
        if result.embeddings:
            return result.embeddings[0].values
        return None
    except Exception as exc:
        logger.error(f"Gemini embed error: {exc}")
        return None
