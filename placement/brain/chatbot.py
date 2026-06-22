"""
brain/chatbot.py
Feature 7 — AI Chat Assistant for Students, Faculty, and Recruiters.
Online: Gemini chat session with role-specific system prompt.
Offline: Custom regex intent router with data-driven answers.
"""
import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)


# ─── ONLINE CHAT ──────────────────────────────────────────────────────────────

def _chat_online(message: str, role: str, context: dict) -> Optional[str]:
    from brain.ai_services import gemini_generate
    from brain.prompt_templates import CHAT_SYSTEM_PROMPT
    prompt = CHAT_SYSTEM_PROMPT.format(role=role, context=str(context))
    full_prompt = f"{prompt}\n\nUser message: {message}"
    return gemini_generate(full_prompt, max_tokens=1024)


# ─── INTENT DETECTION ────────────────────────────────────────────────────────

def _detect_intent(message: str) -> str:
    from brain.prompt_templates import CHAT_INTENTS
    msg_lower = message.lower()
    for intent, patterns in CHAT_INTENTS.items():
        if any(p in msg_lower for p in patterns):
            return intent
    return "unknown"


# ─── OFFLINE RESPONSE ENGINE ──────────────────────────────────────────────────

def _offline_student(intent: str, message: str, context: dict) -> str:
    if intent == "job_recommend":
        jobs = context.get("top_jobs", [])
        if jobs:
            lines = "\n".join(f"• {j['job_title']} at {j['company']} ({j['match_percentage']}% match)" for j in jobs[:3])
            return f"Based on your skills, here are your top job matches:\n{lines}\n\nVisit the Jobs page to apply!"
        return "Please upload your resume first so I can analyse your skills and recommend the best jobs for you."

    if intent == "interview_help":
        return ("Great! To prepare for your interview:\n"
                "1. Review your technical skills and practice coding challenges.\n"
                "2. Use the 'Generate Interview Questions' feature to get role-specific questions.\n"
                "3. Practice the STAR method for HR questions.\n"
                "4. Research the company thoroughly before the interview.")

    if intent == "exam_explain":
        score = context.get("last_score")
        return (f"Your last exam score was {score}. " if score else "") + (
            "To improve:\n"
            "1. Review each wrong answer in the detailed results page.\n"
            "2. Focus on subjects with low scores.\n"
            "3. Practice more questions using the Playground feature.\n"
            "4. Revisit course materials for weak topics.")

    if intent == "aptitude":
        return ("Here's an aptitude question:\n\n"
                "Q: A train travels 360 km in 4 hours. Find its speed in m/s.\n\n"
                "Hint: Speed = Distance/Time. Convert km/h to m/s by multiplying by 5/18.\n\n"
                "Answer: 360/4 = 90 km/h = 90 × 5/18 = 25 m/s ✅")

    if intent == "prep_plan":
        return ("Here is a 4-week placement preparation plan:\n"
                "Week 1: DSA basics — arrays, strings, sorting\n"
                "Week 2: OOP concepts + DBMS\n"
                "Week 3: System design basics + OS concepts\n"
                "Week 4: Mock interviews + resume polish\n\n"
                "Use the AI Resume Analyzer to improve your resume score!")

    if intent == "greeting":
        return "Hello! 👋 I'm your SSSIT Placement Assistant. I can help you find jobs, prepare for interviews, explain exam results, and more. What would you like help with?"

    return ("I'm here to help! You can ask me to:\n"
            "• Recommend jobs based on your skills\n"
            "• Generate interview questions\n"
            "• Explain your exam results\n"
            "• Create a placement preparation plan\n"
            "• Generate aptitude practice questions")


def _offline_faculty(intent: str, message: str, context: dict) -> str:
    if intent == "weak_students":
        students = context.get("weak_students", [])
        if students:
            names = ", ".join(s.get("username", "") for s in students[:5])
            return f"Students who may need additional training: {names}\n\nThey have scored below average in recent exams. Consider scheduling extra sessions."
        return "Based on exam data, students with below-50% scores need immediate attention. Run the AI Report to get a full list."

    if intent in ("placement_report", "department_report"):
        return "Generating the full placement report... Please click 'Generate Report' in the AI Reports section for the complete analysis."

    if intent == "greeting":
        return "Hello Faculty! 👋 I can help you identify weak students, generate placement reports, and analyse department performance. What would you like?"

    return ("As faculty, you can ask me to:\n"
            "• Identify students needing training\n"
            "• Generate placement/exam performance reports\n"
            "• Analyse department performance\n"
            "• View skill gap summaries")


def _offline_recruiter(intent: str, message: str, context: dict) -> str:
    if intent == "candidate_find":
        return "Use the 'Candidate Ranker' feature — type your requirements (e.g., 'Django, React, AWS') and get AI-ranked candidates instantly."

    if intent == "resume_summary":
        return "Go to the Candidate Ranker page, select a candidate, and click 'Summarise Resume' to get an instant AI summary."

    if intent == "rank_applicant":
        return "The Candidate Ranker uses cosine similarity to rank all students by your search query. Try it now!"

    if intent == "greeting":
        return "Hello! 👋 I can help you find the best candidates, rank applicants, and summarise resumes. What are you looking for?"

    return ("As a recruiter, I can help you:\n"
            "• Find candidates matching your requirements\n"
            "• Rank applicants by skill match\n"
            "• Summarise candidate resumes\n"
            "• Compare multiple candidates")


# ─── PUBLIC INTERFACE ─────────────────────────────────────────────────────────

def chat(message: str, role: str = "student", context: dict = None) -> str:
    """
    Feature 7 — Main chatbot entry point.
    role: 'student' | 'faculty' | 'recruiter'
    context: dict of relevant data (jobs, scores, etc.)
    """
    if context is None:
        context = {}

    # Try online Gemini first
    response = _chat_online(message, role, context)
    if response:
        return response

    # Offline intent routing
    intent = _detect_intent(message)
    role_lower = role.lower()

    if "faculty" in role_lower:
        return _offline_faculty(intent, message, context)
    elif "recruiter" in role_lower:
        return _offline_recruiter(intent, message, context)
    else:
        return _offline_student(intent, message, context)
