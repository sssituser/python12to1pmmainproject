"""
brain/candidate_ranker.py
Feature 5 — Rank student candidates by relevance to a recruiter search query.
Online: Gemini embeddings for semantic search.
Offline: TF-IDF cosine similarity.
"""
import logging
from typing import List

logger = logging.getLogger(__name__)


def _build_candidate_text(profile) -> str:
    """Build a searchable text blob from a StudentProfile object."""
    skills = " ".join(s.name for s in profile.skills.all()) if hasattr(profile, 'skills') else ""
    return (
        f"{skills} "
        f"{profile.college or ''} "
        f"{profile.year or ''} "
        f"{profile.user.get_full_name() or profile.user.username} "
        f"cgpa {profile.cgpa or ''}"
    ).strip()


def rank_candidates(query: str, top_k: int = 10) -> List[dict]:
    """
    Feature 5 — Search all student profiles by natural language query.
    Returns ranked list of candidate dicts sorted by relevance score.
    """
    from brain.embeddings import embed_text
    from brain.vector_store import search, rebuild_all_profiles, count

    # If store is empty, rebuild it from DB first
    if count() == 0:
        logger.info("Vector store empty — rebuilding from DB...")
        rebuild_all_profiles()

    query_vec = embed_text(query)
    results = search(query_vec, top_k=top_k)

    ranked = []
    for sid, score, meta in results:
        ranked.append({
            "student_id": sid,
            "username": meta.get("username", ""),
            "full_name": meta.get("full_name", ""),
            "email": meta.get("email", ""),
            "college": meta.get("college", ""),
            "cgpa": meta.get("cgpa", 0),
            "skills": meta.get("skills", []),
            "relevance_score": score,
        })
    return ranked


def index_candidate(profile) -> None:
    """
    Index (or re-index) a single student profile into the vector store.
    Call this after resume upload / profile update.
    """
    from brain.embeddings import embed_text
    from brain.vector_store import upsert

    text = _build_candidate_text(profile)
    vec = embed_text(text)
    meta = {
        "username": profile.user.username,
        "full_name": profile.user.get_full_name() or profile.user.username,
        "email": profile.user.email,
        "college": profile.college or "",
        "cgpa": profile.cgpa or 0,
        "skills": [s.name for s in profile.skills.all()] if hasattr(profile, 'skills') else [],
    }
    upsert(str(profile.id), vec, meta)
    logger.info(f"Indexed candidate profile {profile.id} — {profile.user.username}")
