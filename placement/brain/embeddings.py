"""
brain/embeddings.py
Generates vector embeddings for text.
Online: Google Gemini text-embedding-004
Offline: Custom TF-IDF sparse vector
"""
import math
import re
import logging
from typing import List, Optional

logger = logging.getLogger(__name__)


def _tokenize(text: str) -> List[str]:
    """Lowercase, strip punctuation, split into tokens."""
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return [t for t in text.split() if len(t) > 1]


def _tfidf_vector(text: str, vocab: List[str]) -> List[float]:
    """Build a TF-IDF-inspired unit vector over the given vocab."""
    tokens = _tokenize(text)
    total = len(tokens) if tokens else 1
    tf: dict = {}
    for tok in tokens:
        tf[tok] = tf.get(tok, 0) + 1

    vec = []
    for word in vocab:
        tf_val = tf.get(word, 0) / total
        idf_val = 1.0 + math.log(1 + tf_val)  # smoothed IDF approximation
        vec.append(tf_val * idf_val)

    # L2-normalise
    norm = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / norm for v in vec]


# Build a fixed shared vocabulary from the skill keywords
def _build_vocab() -> List[str]:
    from brain.prompt_templates import TECHNICAL_SKILLS_KEYWORDS, SOFT_SKILLS_KEYWORDS
    raw = TECHNICAL_SKILLS_KEYWORDS + SOFT_SKILLS_KEYWORDS
    return list(dict.fromkeys(w.lower() for w in raw))  # deduplicated, ordered


_VOCAB: Optional[List[str]] = None


def get_vocab() -> List[str]:
    global _VOCAB
    if _VOCAB is None:
        _VOCAB = _build_vocab()
    return _VOCAB


def embed_text(text: str) -> List[float]:
    """
    Returns an embedding vector for text.
    Tries Gemini online first; falls back to offline TF-IDF.
    """
    from brain.ai_services import gemini_embed
    online_vec = gemini_embed(text)
    if online_vec:
        return online_vec
    # Offline fallback
    return _tfidf_vector(text, get_vocab())


def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """Compute cosine similarity between two vectors."""
    if not vec_a or not vec_b:
        return 0.0
    min_len = min(len(vec_a), len(vec_b))
    dot = sum(vec_a[i] * vec_b[i] for i in range(min_len))
    norm_a = math.sqrt(sum(v * v for v in vec_a)) or 1e-9
    norm_b = math.sqrt(sum(v * v for v in vec_b)) or 1e-9
    return dot / (norm_a * norm_b)
