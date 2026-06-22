"""
brain/report_generator.py
Feature 6 — Generate natural-language AI reports for faculty.
Online: Gemini writes the full narrative report.
Offline: Template-based statistical report builder.
"""
import logging
from typing import Optional

logger = logging.getLogger(__name__)


def _collect_data() -> dict:
    """Aggregate statistics from the database."""
    try:
        from myapp.models import (
            StudentProfile, ExamAttempt, AppliedJob, User
        )
        total_students = User.objects.filter(role='student').count()
        total_attempts = ExamAttempt.objects.count()
        avg_score = 0
        if total_attempts:
            from django.db.models import Avg
            avg_obj = ExamAttempt.objects.aggregate(avg=Avg('score'))
            avg_score = round(avg_obj['avg'] or 0, 1)

        # Pass/fail
        passed = ExamAttempt.objects.filter(status='completed').count()
        applications = AppliedJob.objects.count()
        hired = AppliedJob.objects.filter(status='accepted').count()

        # Top performers
        from django.db.models import Sum
        top = (ExamAttempt.objects.values('user__username')
               .annotate(total=Sum('score'))
               .order_by('-total')[:5])
        top_names = [t['user__username'] for t in top]

        # Subject-wise averages
        from django.db.models import Count
        subjects = (ExamAttempt.objects.values('exam_title')
                    .annotate(avg_s=Avg('score'), count=Count('id'))
                    .order_by('-avg_s')[:5])

        return {
            "total_students": total_students,
            "total_attempts": total_attempts,
            "avg_score": avg_score,
            "passed": passed,
            "failed": total_attempts - passed,
            "applications": applications,
            "hired": hired,
            "placement_rate": round((hired / total_students * 100), 1) if total_students else 0,
            "top_performers": top_names,
            "subject_averages": [
                {"subject": s['exam_title'], "avg": round(s['avg_s'] or 0, 1), "count": s['count']}
                for s in subjects
            ],
        }
    except Exception as e:
        logger.error(f"Data collection error: {e}")
        return {}


def _report_online(data: dict) -> Optional[str]:
    from brain.ai_services import gemini_generate
    from brain.prompt_templates import REPORT_PROMPT
    prompt = REPORT_PROMPT.format(data=str(data))
    return gemini_generate(prompt, max_tokens=2048)


def _report_offline(data: dict) -> str:
    """Build a structured template report from aggregated data."""
    top = ", ".join(data.get("top_performers", [])) or "N/A"
    subjects = data.get("subject_averages", [])
    subj_lines = "\n".join(
        f"  • {s['subject']}: avg {s['avg']} points across {s['count']} attempts"
        for s in subjects
    ) or "  • No subject data available."

    report = f"""
📊 SSSIT PLACEMENT PORTAL — AI PERFORMANCE REPORT
══════════════════════════════════════════════════

📌 OVERVIEW
Total Students: {data.get('total_students', 0)}
Total Exam Attempts: {data.get('total_attempts', 0)}
Overall Average Score: {data.get('avg_score', 0)} points
Passed: {data.get('passed', 0)} | Failed: {data.get('failed', 0)}

💼 PLACEMENT SUMMARY
Total Job Applications: {data.get('applications', 0)}
Placements (Selected): {data.get('hired', 0)}
Overall Placement Rate: {data.get('placement_rate', 0)}%

🏆 TOP PERFORMERS
{top}

📚 SUBJECT-WISE PERFORMANCE
{subj_lines}

📋 RECOMMENDATIONS
• Focus additional training on subjects with low average scores.
• Encourage students with fewer than 5 exam attempts to participate more.
• Organise mock interview sessions for students not yet placed.
• Provide targeted workshops for the top missing skills identified in resumes.
• Monitor placement rate weekly and escalate if below 50%.
""".strip()
    return report


# ─── PUBLIC INTERFACE ─────────────────────────────────────────────────────────

def generate_report(report_type: str = "full") -> dict:
    """
    Feature 6 — Returns a dict: { 'report': '<text>', 'data': {...} }
    """
    data = _collect_data()
    report_text = _report_online(data)
    if not report_text:
        report_text = _report_offline(data)
    return {"report": report_text, "data": data}
