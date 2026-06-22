"""
myapp/views/ai_views.py
All DRF API views for the AI module.
Each view delegates to the appropriate brain/ module.
"""
import logging

from rest_framework.decorators import api_view, authentication_classes, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────────────────────
# FEATURE 1: RESUME ANALYZER
# POST /api/ai/analyze-resume/
# ──────────────────────────────────────────────────────────────────────────────

@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def analyze_resume_view(request):
    """Upload and analyse a resume (PDF/DOCX). Stores result in DB."""
    from myapp.models import StudentProfile, ResumeAnalysis
    from brain.resume_analyzer import analyze_resume
    from brain.ats_score import compute_ats_score
    from brain.candidate_ranker import index_candidate

    resume_file = request.FILES.get("resume")
    if not resume_file:
        return Response({"error": "No resume file provided."}, status=400)

    ext = resume_file.name.lower().split(".")[-1]
    if ext not in ("pdf", "doc", "docx"):
        return Response({"error": "Only PDF and DOCX files are supported."}, status=400)

    if resume_file.size > 5 * 1024 * 1024:
        return Response({"error": "File size exceeds 5 MB limit."}, status=400)

    try:
        profile, _ = StudentProfile.objects.get_or_create(user=request.user)

        # Parse resume
        parsed = analyze_resume(resume_file, resume_file.name)
        raw_text = parsed.get("raw_text", "")

        # ATS score
        ats_score, improvements = compute_ats_score(raw_text, parsed)

        # Persist to DB
        analysis, _ = ResumeAnalysis.objects.update_or_create(
            student=profile,
            defaults={
                "raw_text": raw_text[:10000],
                "technical_skills": parsed.get("technical_skills", []),
                "soft_skills": parsed.get("soft_skills", []),
                "education": parsed.get("education", []),
                "projects": parsed.get("projects", []),
                "certifications": parsed.get("certifications", []),
                "ats_score": ats_score,
                "improvements": improvements,
            },
        )

        # Re-index candidate in the vector store (for Feature 5)
        try:
            index_candidate(profile)
        except Exception as e:
            logger.warning(f"Candidate indexing failed: {e}")

        return Response({
            "success": True,
            "technical_skills": parsed.get("technical_skills", []),
            "soft_skills": parsed.get("soft_skills", []),
            "education": parsed.get("education", []),
            "projects": parsed.get("projects", []),
            "certifications": parsed.get("certifications", []),
            "ats_score": ats_score,
            "improvements": improvements,
        })

    except Exception as e:
        logger.error(f"analyze_resume_view error: {e}", exc_info=True)
        return Response({"error": str(e)}, status=500)


@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_resume_analysis_view(request):
    """GET — Retrieve the stored resume analysis for the logged-in student."""
    from myapp.models import StudentProfile, ResumeAnalysis

    try:
        profile = StudentProfile.objects.get(user=request.user)
        analysis = ResumeAnalysis.objects.get(student=profile)
        return Response({
            "technical_skills": analysis.technical_skills,
            "soft_skills": analysis.soft_skills,
            "education": analysis.education,
            "projects": analysis.projects,
            "certifications": analysis.certifications,
            "ats_score": analysis.ats_score,
            "improvements": analysis.improvements,
            "analyzed_at": analysis.analyzed_at.isoformat(),
        })
    except (StudentProfile.DoesNotExist, ResumeAnalysis.DoesNotExist):
        return Response({"error": "No resume analysis found. Please upload your resume first."}, status=404)
    except Exception as e:
        logger.error(f"get_resume_analysis_view error: {e}")
        return Response({"error": str(e)}, status=500)


# ──────────────────────────────────────────────────────────────────────────────
# FEATURE 2: JOB RECOMMENDATIONS
# GET /api/ai/job-recommendations/
# ──────────────────────────────────────────────────────────────────────────────

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def job_recommendations_view(request):
    """Recommend and rank all open jobs by match with student's skills."""
    from myapp.models import StudentProfile, ResumeAnalysis, Job
    from brain.job_matcher import recommend_jobs

    try:
        profile = StudentProfile.objects.get(user=request.user)
    except StudentProfile.DoesNotExist:
        return Response({"error": "Student profile not found."}, status=404)

    # Get skills from resume analysis or profile skills
    student_skills = []
    try:
        analysis = ResumeAnalysis.objects.get(student=profile)
        student_skills = analysis.technical_skills + analysis.soft_skills
    except ResumeAnalysis.DoesNotExist:
        student_skills = [s.name for s in profile.skills.all()]

    if not student_skills:
        return Response({"error": "No skills found. Please upload your resume or add skills to your profile."}, status=400)

    jobs = Job.objects.filter(status="Open")
    ranked = recommend_jobs(student_skills, jobs)
    return Response({"jobs": ranked, "total": len(ranked), "student_skills": student_skills})


# ──────────────────────────────────────────────────────────────────────────────
# FEATURE 3: SKILL GAP ANALYSIS
# GET /api/ai/skill-gap/?job_id=<id>
# ──────────────────────────────────────────────────────────────────────────────

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def skill_gap_view(request):
    """Return skill gap between student skills and a specific job."""
    from myapp.models import StudentProfile, ResumeAnalysis, Job
    from brain.job_matcher import skill_gap_analysis

    job_id = request.query_params.get("job_id")
    if not job_id:
        return Response({"error": "job_id query parameter is required."}, status=400)

    try:
        job = Job.objects.get(id=job_id)
    except Job.DoesNotExist:
        return Response({"error": "Job not found."}, status=404)

    try:
        profile = StudentProfile.objects.get(user=request.user)
    except StudentProfile.DoesNotExist:
        return Response({"error": "Student profile not found."}, status=404)

    student_skills = []
    try:
        analysis = ResumeAnalysis.objects.get(student=profile)
        student_skills = analysis.technical_skills + analysis.soft_skills
    except ResumeAnalysis.DoesNotExist:
        student_skills = [s.name for s in profile.skills.all()]

    gap = skill_gap_analysis(student_skills, job.primary_skills or "")
    return Response({
        "job_title": job.job_title,
        "company": job.company,
        **gap,
    })


# ──────────────────────────────────────────────────────────────────────────────
# FEATURE 4: INTERVIEW QUESTION GENERATOR
# POST /api/ai/generate-interview/
# ──────────────────────────────────────────────────────────────────────────────

@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
@parser_classes([JSONParser])
def generate_interview_view(request):
    """Generate interview questions for a given job and company."""
    from myapp.models import StudentProfile, ResumeAnalysis
    from brain.interview_generator import generate_interview_questions

    job_role = (request.data.get("job_role") or "").strip()
    company = (request.data.get("company") or "General Company").strip()

    if not job_role:
        return Response({"error": "job_role is required."}, status=400)

    student_skills = []
    try:
        profile = StudentProfile.objects.get(user=request.user)
        try:
            analysis = ResumeAnalysis.objects.get(student=profile)
            student_skills = analysis.technical_skills + analysis.soft_skills
        except ResumeAnalysis.DoesNotExist:
            student_skills = [s.name for s in profile.skills.all()]
    except StudentProfile.DoesNotExist:
        pass

    questions = generate_interview_questions(job_role, company, student_skills)
    return Response({"job_role": job_role, "company": company, **questions})


# ──────────────────────────────────────────────────────────────────────────────
# FEATURE 5: CANDIDATE RANKER (Recruiter / Faculty)
# GET /api/ai/rank-candidates/?query=<search>
# ──────────────────────────────────────────────────────────────────────────────

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def rank_candidates_view(request):
    """Rank student candidates by a natural language search query."""
    from brain.candidate_ranker import rank_candidates

    query = (request.query_params.get("query") or "").strip()
    if not query:
        return Response({"error": "query parameter is required."}, status=400)

    top_k = int(request.query_params.get("top_k", 10))
    results = rank_candidates(query, top_k=top_k)
    return Response({"query": query, "candidates": results, "total": len(results)})


# ──────────────────────────────────────────────────────────────────────────────
# FEATURE 6: AI REPORT GENERATOR (Faculty)
# GET /api/ai/generate-report/
# ──────────────────────────────────────────────────────────────────────────────

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def generate_report_view(request):
    """Generate a comprehensive placement performance report for faculty."""
    from brain.report_generator import generate_report

    report_type = request.query_params.get("type", "full")
    result = generate_report(report_type)
    return Response(result)


# ──────────────────────────────────────────────────────────────────────────────
# FEATURE 7: AI CHAT ASSISTANT
# POST /api/ai/chat/
# ──────────────────────────────────────────────────────────────────────────────

@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
@parser_classes([JSONParser])
def chat_view(request):
    """AI chat endpoint — returns a context-aware response."""
    from brain.chatbot import chat
    from myapp.models import StudentProfile, ResumeAnalysis, Job

    message = (request.data.get("message") or "").strip()
    if not message:
        return Response({"error": "message is required."}, status=400)

    # Determine role from the logged-in user
    user = request.user
    role = getattr(user, "role", "student")

    # Build context data
    context = {}
    try:
        if role == "student":
            profile = StudentProfile.objects.get(user=user)
            student_skills = []
            try:
                analysis = ResumeAnalysis.objects.get(student=profile)
                student_skills = analysis.technical_skills + analysis.soft_skills
                context["ats_score"] = analysis.ats_score
            except ResumeAnalysis.DoesNotExist:
                student_skills = [s.name for s in profile.skills.all()]

            # Top 3 job recommendations for context
            if student_skills:
                from brain.job_matcher import recommend_jobs
                jobs = Job.objects.filter(status="Open")
                context["top_jobs"] = recommend_jobs(student_skills, jobs)[:3]

    except Exception as e:
        logger.warning(f"Context build failed: {e}")

    response_text = chat(message, role=role, context=context)
    return Response({"message": message, "response": response_text, "role": role})
