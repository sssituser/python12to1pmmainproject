from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from myapp.models import StudentProfile, ExamAttempt, JobApplication


#  MAIN DASHBOARD STATS
@api_view(['GET'])
def student_stats(request):
    users = User.objects.all()

    students = []
    total_score = 0
    total_exams = 0
    placed_count = 0

    for user in users:
        profile = StudentProfile.objects.filter(user=user).first()
        exams = ExamAttempt.objects.filter(user=user)

        avg_score = (
            sum(e.score for e in exams) / exams.count()
            if exams.exists()
            else 0
        )

        job = JobApplication.objects.filter(user_id=user.id).first()

        if job and job.status == "Placed":
            placed_count += 1

        students.append({
            "id": user.id,
            "name": user.username,
            "cgpa": profile.cgpa if profile else 0,
            "college": profile.college if profile else "N/A",

            "avg_score": round(avg_score, 2),
            "exam_count": exams.count(),

            "job_status": job.status if job else "Not Applied",
        })

        total_score += avg_score
        total_exams += exams.count()

    total_students = users.count()

    return Response({
        "kpis": {
            "total_students": total_students,
            "placed": placed_count,
            "avg_score": round(total_score / total_students, 2) if total_students else 0,
            "total_exams": total_exams
        },
        "students": students
    })


#  STUDENT DETAIL
@api_view(['GET'])
def student_detail(request, id):
    user = get_object_or_404(User, id=id)

    profile = StudentProfile.objects.filter(user=user).first()
    exams = ExamAttempt.objects.filter(user=user)
    job = JobApplication.objects.filter(user_id=user.id).first()

    return Response({
        "name": user.username,
        "email": user.email,
        "college": profile.college if profile else "",
        "cgpa": profile.cgpa if profile else "",

        "exam_scores": [e.score for e in exams],
        "total_exams": exams.count(),

        "job_status": job.status if job else "Not Applied",
    })