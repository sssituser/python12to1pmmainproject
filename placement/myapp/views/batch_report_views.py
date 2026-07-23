from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Avg, Max, Min, Sum, Q
from myapp.models import Batch, CourseEnrollment, Exam, ExamAttempt, Attendance, User

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_batch_report(request, batch_id):
    """
    Generate performance and attendance reports for a specific batch.
    """
    batch = get_object_or_404(Batch, id=batch_id)
    
    # 1. Enrolled Students count
    students = CourseEnrollment.objects.filter(batch=batch).values_list('user_id', flat=True)
    total_students = len(students)
    
    # 2. Exam metrics
    exams = Exam.objects.filter(batch=batch)
    attempts = ExamAttempt.objects.filter(exam__in=exams, user_id__in=students)
    
    avg_marks = attempts.aggregate(Avg('score'))['score__avg'] or 0
    highest_score = attempts.aggregate(Max('score'))['score__max'] or 0
    lowest_score = attempts.aggregate(Min('score'))['score__min'] or 0
    
    # Pass Percentage (passing score is >= 40% of total marks)
    total_attempts = attempts.count()
    passed_attempts = 0
    for att in attempts:
        total_m = att.exam.total_marks or 100
        if att.score >= (0.4 * total_m):
            passed_attempts += 1
    pass_percent = (passed_attempts / total_attempts * 100) if total_attempts > 0 else 0
    
    # 3. Attendance Rate
    total_attendance_records = Attendance.objects.filter(batch=batch, student_id__in=students).count()
    present_records = Attendance.objects.filter(batch=batch, student_id__in=students, status='Present').count()
    attendance_rate = (present_records / total_attendance_records * 100) if total_attendance_records > 0 else 0
    
    # 4. Top 10 Students (Leaderboard)
    student_totals = []
    for s_id in students:
        student_user = User.objects.filter(id=s_id).first()
        if not student_user:
            continue
        student_attempts = attempts.filter(user_id=s_id)
        total_score = student_attempts.aggregate(Sum('score'))['score__sum'] or 0
        student_totals.append({
            "id": s_id,
            "username": student_user.username,
            "email": student_user.email,
            "total_score": total_score
        })
    # Sort and slice top 10
    top_10 = sorted(student_totals, key=lambda x: x['total_score'], reverse=True)[:10]
    
    report_data = {
        "batch_id": batch.id,
        "batch_name": batch.name,
        "total_students": total_students,
        "average_marks": round(avg_marks, 1),
        "highest_score": highest_score,
        "lowest_score": lowest_score,
        "pass_percentage": round(pass_percent, 1),
        "attendance_percentage": round(attendance_rate, 1),
        "top_students": top_10
    }
    
    return Response({"success": True, "data": report_data})
