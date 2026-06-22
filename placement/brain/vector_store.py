"""
brain/vector_store.py
Lightweight in-process vector store.
Stores { student_id: { 'vector': [...], 'meta': {...} } }
Backed by a JSON file on disk for persistence across requests.
"""
import json
import logging
import os
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

_STORE_PATH = os.path.join(os.path.dirname(__file__), "_vector_store.json")

_store: Dict[str, dict] = {}
_loaded = False


def _load():
    global _store, _loaded
    if _loaded:
        return
    if os.path.exists(_STORE_PATH):
        try:
            with open(_STORE_PATH, "r", encoding="utf-8") as f:
                _store = json.load(f)
        except Exception as e:
            logger.warning(f"Vector store load failed: {e}")
            _store = {}
    _loaded = True


def _save():
    try:
        with open(_STORE_PATH, "w", encoding="utf-8") as f:
            json.dump(_store, f)
    except Exception as e:
        logger.error(f"Vector store save failed: {e}")


def upsert(student_id: str, vector: List[float], meta: dict):
    """Insert or update a candidate's vector and metadata."""
    _load()
    _store[str(student_id)] = {"vector": vector, "meta": meta}
    _save()


def search(query_vector: List[float], top_k: int = 10) -> List[Tuple[str, float, dict]]:
    """
    Return top_k candidates ranked by cosine similarity to query_vector.
    Returns list of (student_id, score, meta).
    """
    _load()
    from brain.embeddings import cosine_similarity

    results = []
    for sid, entry in _store.items():
        score = cosine_similarity(query_vector, entry["vector"])
        results.append((sid, round(score * 100, 2), entry.get("meta", {})))

    results.sort(key=lambda x: x[1], reverse=True)
    return results[:top_k]


def delete(student_id: str):
    _load()
    _store.pop(str(student_id), None)
    _save()


def count() -> int:
    _load()
    return len(_store)


def rebuild_all_profiles():
    """
    Rebuild the vector store from the database.
    Call this from a management command or after bulk imports.
    """
    from brain.embeddings import embed_text
    try:
        from myapp.models import StudentProfile, Skill
        profiles = StudentProfile.objects.select_related("user").prefetch_related("skills")
        for profile in profiles:
            skills = " ".join(s.name for s in profile.skills.all())
            text = f"{skills} {profile.college or ''} {profile.year or ''}"
            vec = embed_text(text)
            meta = {
                "username": profile.user.username,
                "full_name": profile.user.get_full_name() or profile.user.username,
                "email": profile.user.email,
                "college": profile.college or "",
                "cgpa": profile.cgpa or 0,
                "skills": [s.name for s in profile.skills.all()],
            }
            upsert(str(profile.id), vec, meta)
        logger.info(f"Vector store rebuilt with {count()} profiles.")
    except Exception as e:
        logger.error(f"rebuild_all_profiles failed: {e}")
