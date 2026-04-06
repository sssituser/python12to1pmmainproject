from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import models
from django.contrib.auth import get_user_model
from myapp.models import StudentProfile, ExamAttempt, JobApplication, Job

User = get_user_model()


# DASHBOARD STATS API
@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_stats_api(request):
    """Get overall dashboard statistics"""
    users = User.objects.all()
    students = users.filter(role='student')
    faculty = users.filter(role='faculty')
    
    # Get actual student profiles
    student_profiles = StudentProfile.objects.all()
    
    # Calculate placement statistics
    placed_applications = JobApplication.objects.filter(status='Placed').count()
    total_applications = JobApplication.objects.count()
    
    # Calculate exam statistics
    total_exams = ExamAttempt.objects.count()
    avg_score = 0
    if total_exams > 0:
        score_data = ExamAttempt.objects.aggregate(avg_score=models.Avg('score'))
        avg_score = score_data.get('avg_score', 0) if score_data else 0
    
    # Count active students
    active_students = students.filter(is_active=True).count()
    
    # Count total jobs
    total_jobs = Job.objects.count()
    
    return Response({
        'success': True,
        'total_students': students.count(),
        'total_faculty': faculty.count(),
        'total_users': users.count(),
        'active_students': active_students,
        'placed_students': placed_applications,
        'total_jobs': total_jobs,
        'total_applications': total_applications,
        'placement_rate': round((placed_applications / total_applications * 100), 2) if total_applications > 0 else 0,
        'total_exams': total_exams,
        'average_score': round(avg_score, 2),
        'recent_activity': 'Dashboard loaded successfully'
    })


# STUDENTS LIST API
@api_view(['GET'])
@permission_classes([AllowAny])
def students_api(request):
    """Get list of all students with real data"""
    # Get students with role='student'
    student_users = User.objects.filter(role='student')
    students_list = []
    
    for user in student_users:
        # Get student profile
        profile = StudentProfile.objects.filter(user=user).first()
        
        # Get exam attempts for this student
        exams = ExamAttempt.objects.filter(user=user)
        avg_score = 0
        if exams.exists():
            scores = [exam.score for exam in exams if hasattr(exam, 'score') and exam.score is not None]
            if scores:
                avg_score = sum(scores) / len(scores)
        
        # Get job applications for this student
        job_app = JobApplication.objects.filter(user_id=user.id).first()
        
        # Construct a dynamic full name
        full_name = f"{user.first_name} {user.last_name}".strip()
        display_name = full_name if full_name else user.username
        
        students_list.append({
            'id': user.id,
            'studentId': profile.student_id if profile and profile.student_id else user.id,
            'name': display_name,
            'username': user.username,
            'email': user.email,
            'phone': profile.phone if profile and profile.phone else '',
            'mobileNo': profile.phone if profile and profile.phone else '', # Alias for frontend compatibility
            'course_title': profile.course.title if profile and profile.course else 'Not assigned',
            'college': profile.college if profile and profile.college else 'N/A',
            'cgpa': profile.cgpa if profile and profile.cgpa else 0,
            'status': 'Active' if user.is_active else 'Inactive',
            'is_active': user.is_active,
            'progress': round(avg_score, 2) if avg_score else 0,
            'exam_count': exams.count(),
            'job_status': job_app.status if job_app else 'Not Applied',
            'date_joined': user.date_joined,
            'last_login': user.last_login
        })
    
    return Response(students_list)


# STUDENT STATS API (alias for student_stats function)
@api_view(['GET'])
@permission_classes([AllowAny])
def student_stats_api(request):
    """Alias for student_stats function to maintain compatibility"""
    try:
        return student_stats(request._request)  # Access Django request
    except Exception as e:
        return Response({
            "success": False,
            "error": str(e)
        }, status=500)


# MAIN DASHBOARD STATS
@api_view(['GET'])
@permission_classes([AllowAny])
def student_stats(request):
    try:
        # Get only students
        student_users = User.objects.filter(role='student')
        
        students = []
        total_score = 0
        total_exams = 0
        placed_count = 0
        
        for user in student_users:
            # Get student profile
            profile = StudentProfile.objects.filter(user=user).first()
            
            # Get exam attempts
            exams = ExamAttempt.objects.filter(user=user)
            
            avg_score = 0
            if exams.exists():
                scores = [exam.score for exam in exams if hasattr(exam, 'score') and exam.score is not None]
                if scores:
                    avg_score = sum(scores) / len(scores)
            
            # Get job applications
            job_app = JobApplication.objects.filter(user_id=user.id).first()
            
            if job_app and job_app.status == "Placed":
                placed_count += 1
            
            students.append({
                "id": user.id,
                "name": user.username,
                "studentId": profile.student_id if profile and profile.student_id else user.id,
                "cgpa": profile.cgpa if profile and hasattr(profile, 'cgpa') else 0,
                "college": profile.college if profile and hasattr(profile, 'college') else "N/A",
                "course_title": profile.course.title if profile and profile.course else "Not assigned",
                "avg_score": round(avg_score, 2),
                "progress": round(avg_score, 2) if avg_score else 0,
                "exam_count": exams.count(),
                "job_status": job_app.status if job_app else "Not Applied",
                "status": 'Active' if user.is_active else 'Inactive',
                "is_active": user.is_active,
                "date_joined": user.date_joined,
                "last_login": user.last_login
            })
            
            total_score += avg_score
            total_exams += exams.count()
        
        total_students = student_users.count()
        
        return Response({
            "success": True,
            "kpis": {
                "total_students": total_students,
                "placed": placed_count,
                "avg_score": round(total_score / total_students, 2) if total_students else 0,
                "total_exams": total_exams
            },
            "students": students
        })
    except Exception as e:
        return Response({
            "success": False,
            "error": str(e)
        }, status=500)


#  STUDENT DETAIL
@api_view(['GET'])
@permission_classes([AllowAny])
def student_detail(request, id):
    try:
        user = get_object_or_404(User, id=id)
        
        profile = StudentProfile.objects.filter(user=user).first()
        exams = ExamAttempt.objects.filter(user=user)
        job = JobApplication.objects.filter(user_id=user.id).first()
        
        return Response({
            "success": True,
            "name": user.username,
            "email": user.email,
            "college": profile.college if profile and hasattr(profile, 'college') else "",
            "cgpa": profile.cgpa if profile and hasattr(profile, 'cgpa') else "",
            
            "exam_scores": [exam.score for exam in exams if hasattr(exam, 'score')],
            "total_exams": exams.count(),
            
            "job_status": job.status if job else "Not Applied",
        })
    except Exception as e:
        return Response({
            "success": False,
            "error": str(e)
        }, status=500)