"""
brain/job_matcher.py
Feature 2 & 3 — Job Recommendations + Skill Gap Analysis.
Online: Gemini matching.
Offline: Cosine similarity + keyword set intersection.
"""
import json
import logging
import re
from typing import List, Optional

logger = logging.getLogger(__name__)

LEARNING_RESOURCES = {
    "python": {"resource": "Python.org Docs + freeCodeCamp", "duration": "4 weeks"},
    "django": {"resource": "Django Official Tutorial + DRF Docs", "duration": "3 weeks"},
    "react": {"resource": "React.dev Official Docs + Scrimba", "duration": "4 weeks"},
    "java": {"resource": "Oracle Java Tutorials + Baeldung", "duration": "5 weeks"},
    "sql": {"resource": "SQLZoo + Mode Analytics SQL Tutorial", "duration": "2 weeks"},
    "docker": {"resource": "Docker Official Docs + TechWorld with Nana", "duration": "2 weeks"},
    "aws": {"resource": "AWS Skill Builder (Free Tier) + A Cloud Guru", "duration": "6 weeks"},
    "machine learning": {"resource": "Andrew Ng ML Course (Coursera) + fast.ai", "duration": "8 weeks"},
    "deep learning": {"resource": "fast.ai + deeplearning.ai Specialization", "duration": "10 weeks"},
    "kubernetes": {"resource": "Kubernetes.io Docs + KodeKloud", "duration": "3 weeks"},
    "mongodb": {"resource": "MongoDB University (Free)", "duration": "2 weeks"},
    "typescript": {"resource": "TypeScript Handbook + Fireship YouTube", "duration": "2 weeks"},
    "node.js": {"resource": "Node.js Official Docs + The Odin Project", "duration": "3 weeks"},
    "git": {"resource": "Pro Git Book (free) + GitHub Skills", "duration": "1 week"},
    "linux": {"resource": "Linux Foundation Free Courses + OverTheWire", "duration": "3 weeks"},
    "default": {"resource": "Coursera / Udemy / YouTube tutorials", "duration": "3 weeks"},
}


def _normalise_skills(skills_input) -> List[str]:
    """Accept string or list; return lowercase list of skills."""
    if isinstance(skills_input, str):
        return [s.strip().lower() for s in re.split(r"[,;|/\n]", skills_input) if s.strip()]
    if isinstance(skills_input, list):
        return [s.strip().lower() for s in skills_input if s.strip()]
    return []


def _get_resource(skill: str) -> dict:
    for key in LEARNING_RESOURCES:
        if key in skill.lower():
            return LEARNING_RESOURCES[key]
    return LEARNING_RESOURCES["default"]


# ─── ONLINE MATCH ─────────────────────────────────────────────────────────────

def _match_online(student_skills: List[str], job_skills: List[str], job_title: str) -> Optional[dict]:
    from brain.ai_services import gemini_generate
    from brain.prompt_templates import JOB_MATCH_PROMPT
    prompt = JOB_MATCH_PROMPT.format(
        student_skills=", ".join(student_skills),
        job_skills=", ".join(job_skills),
        job_title=job_title,
    )
    response = gemini_generate(prompt, max_tokens=1024)
    if not response:
        return None
    try:
        clean = re.sub(r"```json|```", "", response).strip()
        return json.loads(clean)
    except Exception as e:
        logger.warning(f"Job match JSON parse failed: {e}")
        return None


# ─── OFFLINE MATCH ────────────────────────────────────────────────────────────

def _match_offline(student_skills: List[str], job_skills: List[str]) -> dict:
    student_set = set(student_skills)
    job_set = set(job_skills)

    matched = list(student_set & job_set)
    missing = list(job_set - student_set)

    if job_set:
        pct = int(len(matched) / len(job_set) * 100)
    else:
        pct = 0

    learning_suggestions = []
    for skill in missing[:5]:
        res = _get_resource(skill)
        learning_suggestions.append({
            "skill": skill.title(),
            "resource": res["resource"],
            "duration": res["duration"],
        })

    return {
        "match_percentage": pct,
        "matched_skills": [s.title() for s in matched],
        "missing_skills": [s.title() for s in missing],
        "learning_suggestions": learning_suggestions,
    }


# ─── SKILL GAP ANALYSIS ───────────────────────────────────────────────────────

def skill_gap_analysis(student_skills_raw, job_requirements_raw) -> dict:
    """
    Feature 3 — Returns missing skills, a weekly roadmap, and estimated time.
    """
    from brain.ai_services import gemini_generate
    from brain.prompt_templates import SKILL_GAP_PROMPT

    student_skills = _normalise_skills(student_skills_raw)
    job_requirements = _normalise_skills(job_requirements_raw)

    prompt = SKILL_GAP_PROMPT.format(
        student_skills=", ".join(student_skills),
        job_requirements=", ".join(job_requirements),
    )
    response = gemini_generate(prompt, max_tokens=1500)
    if response:
        try:
            clean = re.sub(r"```json|```", "", response).strip()
            return json.loads(clean)
        except Exception:
            pass

    # Offline fallback
    missing = list(set(job_requirements) - set(student_skills))
    roadmap = []
    for i, skill in enumerate(missing[:8]):
        res = _get_resource(skill)
        roadmap.append({
            "week": i * 2 + 1,
            "topic": skill.title(),
            "resources": res["resource"],
        })

    return {
        "missing_skills": [s.title() for s in missing],
        "roadmap": roadmap,
        "estimated_weeks": len(missing) * 2,
    }


# ─── PUBLIC INTERFACE ─────────────────────────────────────────────────────────

def match_job(student_skills_raw, job_skills_raw: str, job_title: str) -> dict:
    """Feature 2 — returns match %, matched skills, missing skills, suggestions."""
    student_skills = _normalise_skills(student_skills_raw)
    job_skills = _normalise_skills(job_skills_raw)

    result = _match_online(student_skills, job_skills, job_title)
    if result:
        return result
    return _match_offline(student_skills, job_skills)


def recommend_jobs(student_skills_raw, jobs_qs) -> List[dict]:
    """
    Feature 2 — Rank all open jobs by match percentage.
    jobs_qs: Django queryset of Job objects.
    Returns sorted list of job dicts with match data.
    """
    student_skills = _normalise_skills(student_skills_raw)
    results = []
    for job in jobs_qs:
        match_data = _match_offline(student_skills, _normalise_skills(job.primary_skills or ""))
        results.append({
            "id": job.id,
            "job_title": job.job_title,
            "company": job.company,
            "location": job.location,
            "job_type": job.job_type,
            "salary": job.salary,
            "deadline": str(job.deadline) if job.deadline else "",
            "primary_skills": job.primary_skills,
            "match_percentage": match_data["match_percentage"],
            "matched_skills": match_data["matched_skills"],
            "missing_skills": match_data["missing_skills"],
            "learning_suggestions": match_data["learning_suggestions"],
        })
    results.sort(key=lambda x: x["match_percentage"], reverse=True)
    return results
