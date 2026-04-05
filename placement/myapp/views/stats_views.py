from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import models
from django.contrib.auth import get_user_model
from myapp.models import StudentProfile, ExamAttempt, JobApplication

User = get_user_model()


# DASHBOARD STATS API
@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_stats_api(request):
    """Get overall dashboard statistics"""
    try:
        users = User.objects.all()
        students = users.filter(role='student')
        faculty = users.filter(role='faculty')
        
        # Calculate placement statistics
        placed_applications = JobApplication.objects.filter(status='Placed').count()
        total_applications = JobApplication.objects.count()
        
        # Calculate exam statistics
        total_exams = ExamAttempt.objects.count()
        avg_score = 0
        if total_exams > 0:
            score_data = ExamAttempt.objects.aggregate(avg_score=models.Avg('score'))
            avg_score = score_data.get('avg_score', 0) if score_data else 0
        
        return Response({
            'success': True,
            'total_students': students.count(),
            'total_faculty': faculty.count(),
            'total_users': users.count(),
            'placed_students': placed_applications,
            'total_applications': total_applications,
            'placement_rate': round((placed_applications / total_applications * 100), 2) if total_applications > 0 else 0,
            'total_exams': total_exams,
            'average_score': round(avg_score, 2),
            'recent_activity': 'Dashboard loaded successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)


# STUDENTS LIST API
@api_view(['GET'])
@permission_classes([AllowAny])
def students_api(request):
    """Get list of all students - MINIMAL WORKING VERSION"""
    try:
        # Use exact same logic as working students_test_api
        users = User.objects.filter(role='student').values('id', 'username', 'email', 'is_active', 'date_joined')
        students_list = list(users)
        
        # Add basic info - NO PROFILE RELATIONSHIPS TO AVOID RELATEDMANAGER
        for student in students_list:
            student['cgpa'] = 0
            student['college'] = 'N/A'
            student['course'] = 'N/A'
            student['phone'] = ''
            student['skills'] = ''
            student['exam_count'] = 0
            student['job_status'] = 'Not Applied'
            student['average_score'] = 0
        
        return Response({
            'students': students_list,
            'total_count': len(students_list)
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)


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
        users = User.objects.all()
        
        students = []
        total_score = 0
        total_exams = 0
        placed_count = 0
        
        for user in users:
            profile = StudentProfile.objects.filter(user=user).first()
            exams = ExamAttempt.objects.filter(user=user)
            
            avg_score = 0
            if exams.exists():
                scores = [exam.score for exam in exams if hasattr(exam, 'score')]
                if scores:
                    avg_score = sum(scores) / len(scores)
            
            job = JobApplication.objects.filter(user_id=user.id).first()
            
            if job and job.status == "Placed":
                placed_count += 1
            
            students.append({
                "id": user.id,
                "name": user.username,
                "cgpa": profile.cgpa if profile and hasattr(profile, 'cgpa') else 0,
                "college": profile.college if profile and hasattr(profile, 'college') else "N/A",
                "avg_score": round(avg_score, 2),
                "exam_count": exams.count(),
                "job_status": job.status if job else "Not Applied",
            })
            
            total_score += avg_score
            total_exams += exams.count()
        
        total_students = users.count()
        
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