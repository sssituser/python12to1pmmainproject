from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from myapp.models import Course, StudentProfile, ExamAttempt, Exam
from django.utils import timezone

User = get_user_model()

@api_view(['GET'])
@permission_classes([AllowAny])
def get_students_and_marks(request):
    course_id = request.query_params.get('course_id')
    exam_title = request.query_params.get('exam_title', '').strip()
    
    if not course_id:
        return Response({"success": False, "error": "course_id is required"}, status=400)
        
    try:
        from myapp.models import CourseEnrollment
        
        # Collect user IDs from both lookup paths (union, deduped)
        seen_user_ids = set()
        
        # Path 1: CourseEnrollment table (most reliable)
        enrollments = CourseEnrollment.objects.filter(course_id=course_id).select_related('user')
        for enrollment in enrollments:
            if enrollment.user and enrollment.user.is_active:
                seen_user_ids.add(enrollment.user.id)
        
        # Path 2: StudentProfile.course FK (legacy / fallback)
        profiles = StudentProfile.objects.filter(course_id=course_id).select_related('user')
        for profile in profiles:
            if profile.user and profile.user.is_active:
                seen_user_ids.add(profile.user.id)
        
        if not seen_user_ids:
            return Response({"success": True, "students": []})

        students_data = []
        for user_id in seen_user_ids:
            user = User.objects.filter(id=user_id, role='student').first()
            if not user:
                continue
                
            # Find existing attempt for this student + exam_title
            attempt = ExamAttempt.objects.filter(user=user, exam_title__iexact=exam_title).first()
            
            students_data.append({
                "student_id": user.id,
                "student_name": f"{user.first_name} {user.last_name}".strip() or user.username,
                "username": user.username,
                "email": user.email,
                "marks_obtained": attempt.marks_obtained if attempt else "",
                "total_marks": attempt.total_marks if attempt else 100,
                "status": attempt.status if attempt else "completed"
            })
        
        # Sort by student name
        students_data.sort(key=lambda x: x['student_name'].lower())
            
        return Response({
            "success": True,
            "students": students_data
        })
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def upload_exam_marks(request):
    data = request.data
    course_id = data.get('course_id')
    exam_title = data.get('exam_title', '').strip()
    marks_list = data.get('marks', []) # List of {student_id, marks_obtained, total_marks, status}
    
    if not course_id or not exam_title:
        return Response({"success": False, "error": "course_id and exam_title are required"}, status=400)
        
    try:
        updated_count = 0
        for item in marks_list:
            student_id = item.get('student_id')
            marks_obtained = item.get('marks_obtained')
            total_marks = item.get('total_marks', 100)
            status = item.get('status', 'completed')
            
            if student_id is None or marks_obtained == "" or marks_obtained is None:
                continue
                
            user = User.objects.filter(id=student_id).first()
            if not user:
                continue
                
            # Create or update ExamAttempt
            attempt, created = ExamAttempt.objects.update_or_create(
                user=user,
                exam_title=exam_title,
                defaults={
                    'score': int(marks_obtained),
                    'marks_obtained': int(marks_obtained),
                    'total_marks': int(total_marks),
                    'status': status,
                    'exam_type': 'manual',
                    'time_taken': 0,
                    'start_time': timezone.now()
                }
            )
            updated_count += 1
            
        return Response({
            "success": True,
            "message": f"Successfully updated/created marks for {updated_count} students.",
            "updated_count": updated_count
        })
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_course_exams(request, course_id):
    try:
        from myapp.models import CourseEnrollment

        # Collect all enrolled user IDs for this course (both paths)
        enrolled_user_ids = set()

        enrollments = CourseEnrollment.objects.filter(course_id=course_id).values_list('user_id', flat=True)
        enrolled_user_ids.update(enrollments)

        profile_users = StudentProfile.objects.filter(course_id=course_id).values_list('user_id', flat=True)
        enrolled_user_ids.update(profile_users)

        # Dynamically gather distinct manual exam titles from ExamAttempt records
        manual_exam_titles = (
            ExamAttempt.objects
            .filter(user_id__in=enrolled_user_ids, exam_type='manual')
            .values_list('exam_title', flat=True)
            .distinct()
            .order_by('exam_title')
        )

        exams_list = [
            {"id": idx + 1, "title": title, "total_marks": 100}
            for idx, title in enumerate(manual_exam_titles)
        ]

        return Response({
            "success": True,
            "exams": exams_list
        })
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)
