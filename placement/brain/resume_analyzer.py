"""
brain/resume_analyzer.py
Feature 1 — Extracts structured information from a PDF/DOCX resume.
Online: Gemini LLM parses the full text.
Offline: Regex + keyword heuristic parser.
"""
import json
import logging
import re
from typing import IO, Optional

logger = logging.getLogger(__name__)


# ─── TEXT EXTRACTION ──────────────────────────────────────────────────────────

def extract_text_from_pdf(file_obj: IO[bytes]) -> str:
    """Extract plain text from a PDF file object using pypdf."""
    try:
        from pypdf import PdfReader
        reader = PdfReader(file_obj)
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n".join(pages).strip()
    except Exception as e:
        logger.error(f"PDF extraction error: {e}")
        return ""


def extract_text_from_docx(file_obj: IO[bytes]) -> str:
    """Extract plain text from a DOCX file object using python-docx."""
    try:
        from docx import Document
        doc = Document(file_obj)
        return "\n".join(p.text for p in doc.paragraphs if p.text.strip())
    except Exception as e:
        logger.error(f"DOCX extraction error: {e}")
        return ""


def extract_text(file_obj: IO[bytes], filename: str) -> str:
    """Route to PDF or DOCX extractor based on file extension."""
    fname = filename.lower()
    if fname.endswith(".pdf"):
        return extract_text_from_pdf(file_obj)
    elif fname.endswith((".docx", ".doc")):
        return extract_text_from_docx(file_obj)
    else:
        try:
            return file_obj.read().decode("utf-8", errors="ignore")
        except Exception:
            return ""


# ─── ONLINE PARSER ────────────────────────────────────────────────────────────

def _parse_online(resume_text: str) -> Optional[dict]:
    from brain.ai_services import gemini_generate
    from brain.prompt_templates import RESUME_PARSE_PROMPT
    prompt = RESUME_PARSE_PROMPT.format(resume_text=resume_text[:6000])
    response = gemini_generate(prompt, max_tokens=2048)
    if not response:
        return None
    try:
        # Strip markdown code fences if present
        clean = re.sub(r"```json|```", "", response).strip()
        return json.loads(clean)
    except json.JSONDecodeError as e:
        logger.warning(f"Gemini JSON parse failed: {e}")
        return None


# ─── OFFLINE PARSER ───────────────────────────────────────────────────────────

def _parse_offline(resume_text: str) -> dict:
    from brain.prompt_templates import (
        TECHNICAL_SKILLS_KEYWORDS, SOFT_SKILLS_KEYWORDS,
        CERTIFICATION_KEYWORDS, EDUCATION_KEYWORDS, PROJECT_KEYWORDS,
    )
    text_lower = resume_text.lower()

    def find_keywords(keywords):
        found = []
        for kw in keywords:
            if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
                found.append(kw.title())
        return found

    technical_skills = find_keywords(TECHNICAL_SKILLS_KEYWORDS)
    soft_skills = find_keywords(SOFT_SKILLS_KEYWORDS)
    certifications = find_keywords(CERTIFICATION_KEYWORDS)

    # Education extraction: look for lines containing education keywords
    education = []
    for line in resume_text.split("\n"):
        line_lower = line.lower().strip()
        if any(kw in line_lower for kw in EDUCATION_KEYWORDS) and len(line.strip()) > 5:
            education.append({"degree": line.strip(), "institution": "", "year": ""})
    education = education[:5]  # Limit to 5 entries

    # Project extraction: look for lines near project keywords
    projects = []
    lines = resume_text.split("\n")
    for i, line in enumerate(lines):
        line_lower = line.lower().strip()
        if any(kw in line_lower for kw in PROJECT_KEYWORDS) and len(line.strip()) > 10:
            desc = lines[i + 1].strip() if i + 1 < len(lines) else ""
            projects.append({"title": line.strip()[:100], "description": desc[:200]})
    projects = projects[:5]

    return {
        "technical_skills": list(dict.fromkeys(technical_skills)),
        "soft_skills": list(dict.fromkeys(soft_skills)),
        "education": education,
        "projects": projects,
        "certifications": list(dict.fromkeys(certifications)),
    }


# ─── PUBLIC INTERFACE ─────────────────────────────────────────────────────────

def analyze_resume(file_obj: IO[bytes], filename: str) -> dict:
    """
    Main entry point. Returns structured data dict:
      technical_skills, soft_skills, education, projects, certifications, raw_text
    """
    raw_text = extract_text(file_obj, filename)
    if not raw_text:
        return {
            "raw_text": "", "technical_skills": [], "soft_skills": [],
            "education": [], "projects": [], "certifications": [],
        }

    # Try online first
    result = _parse_online(raw_text)
    if result:
        result["raw_text"] = raw_text
        return result

    # Offline fallback
    result = _parse_offline(raw_text)
    result["raw_text"] = raw_text
    return result
