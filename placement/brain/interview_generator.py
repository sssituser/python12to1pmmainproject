"""
brain/interview_generator.py
Feature 4 — Generate Technical, HR, Coding and Company-specific questions.
Online: Gemini generates bespoke questions.
Offline: Questions fetched from local question bank.
"""
import json
import logging
import re
import random
from typing import List, Optional

logger = logging.getLogger(__name__)


def _match_bank_key(skills: List[str]) -> str:
    """Find the best matching question bank category from student skills."""
    from brain.prompt_templates import INTERVIEW_QUESTION_BANK
    priority = ["python", "java", "django", "react", "sql"]
    skill_lower = [s.lower() for s in skills]
    for p in priority:
        if any(p in s for s in skill_lower):
            return p
    return "general"


def _pick(lst: list, n: int) -> list:
    """Randomly pick up to n items from a list."""
    return random.sample(lst, min(n, len(lst)))


# ─── ONLINE GENERATOR ─────────────────────────────────────────────────────────

def _generate_online(job_role: str, company: str, student_skills: List[str]) -> Optional[dict]:
    from brain.ai_services import gemini_generate
    from brain.prompt_templates import INTERVIEW_PROMPT
    prompt = INTERVIEW_PROMPT.format(
        job_role=job_role,
        company=company,
        student_skills=", ".join(student_skills),
    )
    response = gemini_generate(prompt, max_tokens=2048)
    if not response:
        return None
    try:
        clean = re.sub(r"```json|```", "", response).strip()
        return json.loads(clean)
    except Exception as e:
        logger.warning(f"Interview gen JSON parse failed: {e}")
        return None


# ─── OFFLINE GENERATOR ────────────────────────────────────────────────────────

def _generate_offline(job_role: str, company: str, student_skills: List[str]) -> dict:
    from brain.prompt_templates import INTERVIEW_QUESTION_BANK

    key = _match_bank_key(student_skills)
    bank = INTERVIEW_QUESTION_BANK.get(key, {})
    general = INTERVIEW_QUESTION_BANK.get("general", {})

    technical = _pick(bank.get("technical", []) + general.get("technical", []), 5)
    coding = _pick(bank.get("coding", []), 3)
    hr = _pick(general.get("hr", []), 5)

    company_specific = [
        f"Why do you want to work at {company}?",
        f"What do you know about {company}'s products and services?",
        f"How does your experience align with the {job_role} role at {company}?",
    ]

    return {
        "technical": technical,
        "hr": hr,
        "coding": coding,
        "company_specific": company_specific,
    }


# ─── PUBLIC INTERFACE ─────────────────────────────────────────────────────────

def generate_interview_questions(job_role: str, company: str, student_skills_raw) -> dict:
    """
    Feature 4 — Returns dict with keys: technical, hr, coding, company_specific.
    """
    from brain.job_matcher import _normalise_skills
    student_skills = _normalise_skills(student_skills_raw)

    result = _generate_online(job_role, company, student_skills)
    if result:
        return result
    return _generate_offline(job_role, company, student_skills)
