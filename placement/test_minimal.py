from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import JWTAuthentication
from rest_framework.response import Response

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def test_faculty_profile_minimal(request):
    """Minimal test for faculty profile"""
    try:
        from myapp.models import FacultyProfile
        user = request.user
        
        return Response({
            'status': 'success',
            'user_id': user.id,
            'username': user.username,
            'user_role': getattr(user, 'role', 'unknown'),
            'message': 'Faculty profile API working'
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'error': str(e),
            'type': type(e).__name__
        }, status=500)
