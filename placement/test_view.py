from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def test_faculty_profile(request):
    """Test faculty profile API"""
    try:
        from myapp.models import FacultyProfile
        user = request.user
        return Response({
            'message': 'Test successful',
            'user_id': user.id,
            'username': user.username,
            'user_role': getattr(user, 'role', 'unknown'),
            'faculty_profile_table': 'myapp_faculty_profile'
        })
    except Exception as e:
        return Response({
            'error': str(e),
            'type': type(e).__name__
        }, status=500)
