"""
brain/ats_score.py
Feature 1 (Part 2) — Compute ATS Score (0-100) and improvement suggestions.
Online: Gemini scoring.
Offline: Weighted heuristic scoring engine.
"""
import json
import logging
import re
from typing import List, Tuple

logger = logging.getLogger(__name__)


# ─── ONLINE SCORER ────────────────────────────────────────────────────────────

def _score_online(resume_text: str) -> Tuple[int, List[str]]:
    from brain.ai_services import gemini_generate
    from brain.prompt_templates import ATS_SCORE_PROMPT
    prompt = ATS_SCORE_PROMPT.format(resume_text=resume_text[:5000])
    response = gemini_generate(prompt, max_tokens=1024)
    if not response:
        return -1, []
    try:
        clean = re.sub(r"```json|```", "", response).strip()
        data = json.loads(clean)
        return int(data.get("ats_score", -1)), data.get("improvements", [])
    except Exception as e:
        logger.warning(f"ATS online parse failed: {e}")
        return -1, []


# ─── OFFLINE SCORER ───────────────────────────────────────────────────────────

def _score_offline(resume_text: str, parsed: dict) -> Tuple[int, List[str]]:
    """
    Weighted scoring:
      - Technical skills count    (30%)
      - Soft skills present       (10%)
      - Education section         (15%)
      - Projects section          (20%)
      - Certifications present    (10%)
      - Contact info present      (10%)
      - Summary/objective present  (5%)
    """
    score = 0
    improvements = []
    text_lower = resume_text.lower()

    # Technical skills
    tech = parsed.get("technical_skills", [])
    tech_score = min(30, len(tech) * 3)
    score += tech_score
    if len(tech) < 5:
        improvements.append("Add more technical skills relevant to your target role (aim for at least 8-10).")

    # Soft skills
    soft = parsed.get("soft_skills", [])
    soft_score = min(10, len(soft) * 2)
    score += soft_score
    if len(soft) < 3:
        improvements.append("Include soft skills like communication, teamwork, and problem-solving.")

    # Education
    edu = parsed.get("education", [])
    edu_score = min(15, len(edu) * 5)
    score += edu_score
    if not edu:
        improvements.append("Add your educational qualifications including degree, institution, and year.")

    # Projects
    proj = parsed.get("projects", [])
    proj_score = min(20, len(proj) * 5)
    score += proj_score
    if len(proj) < 2:
        improvements.append("Add at least 2-3 projects with clear descriptions and technologies used.")

    # Certifications
    certs = parsed.get("certifications", [])
    cert_score = min(10, len(certs) * 3)
    score += cert_score
    if not certs:
        improvements.append("Include relevant certifications (AWS, Google, NPTEL, Coursera, etc.).")

    # Contact info — look for email/phone patterns
    has_email = bool(re.search(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", resume_text))
    has_phone = bool(re.search(r"(\+91[\-\s]?)?[6-9]\d{9}", resume_text))
    contact_score = (5 if has_email else 0) + (5 if has_phone else 0)
    score += contact_score
    if not has_email:
        improvements.append("Include a professional email address in your contact section.")
    if not has_phone:
        improvements.append("Include your phone number in the contact section.")

    # Summary / Objective
    if any(kw in text_lower for kw in ["objective", "summary", "profile", "about me"]):
        score += 5
    else:
        improvements.append("Add a professional summary or objective at the top of your resume.")

    # Quantifiable achievements bonus
    if re.search(r"\d+%|\d+ years?|₹\d+|\$\d+|led \d+|managed \d+", text_lower):
        score = min(100, score + 5)
    else:
        improvements.append("Add quantifiable achievements (e.g., 'Improved performance by 30%', 'Managed a team of 5').")

    return min(100, score), improvements


# ─── PUBLIC INTERFACE ─────────────────────────────────────────────────────────

def compute_ats_score(resume_text: str, parsed_data: dict) -> Tuple[int, List[str]]:
    """
    Returns (ats_score: int, improvements: list[str]).
    Tries Gemini online; falls back to offline heuristic.
    """
    score, improvements = _score_online(resume_text)
    if score >= 0:
        return score, improvements
    return _score_offline(resume_text, parsed_data)
