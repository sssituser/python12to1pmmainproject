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
        # Get students enrolled in this course
        profiles = StudentProfile.objects.filter(course_id=course_id).select_related('user')
        
        students_data = []
        for profile in profiles:
            user = profile.user
            if not user:
                continue
                
            # Find if there is an existing attempt for this student and exam_title
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
        exams = Exam.objects.filter(course_id=course_id).values('id', 'title', 'total_marks')
        return Response({
            "success": True,
            "exams": list(exams)
        })
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)
