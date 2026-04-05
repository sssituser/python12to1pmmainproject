from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from myapp.models import StudentProfile, ExamAttempt, JobApplication

User = get_user_model()

@api_view(['GET'])
@permission_classes([AllowAny])
def students_test_api(request):
    """Simple test API for students"""
    try:
        students = User.objects.filter(role='student').values('id', 'username', 'email', 'is_active', 'date_joined')
        
        return Response({
            'success': True,
            'students': list(students),
            'total_count': students.count()
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)
