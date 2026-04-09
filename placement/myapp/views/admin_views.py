from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from myapp.models import StudentProfile

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_users_api(request):
    """Get all users with their profiles"""
    users = User.objects.all()
    users_data = []
    
    for user in users:
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'is_active': user.is_active,
            'is_staff': user.is_staff,
            'date_joined': user.date_joined,
            'last_login': user.last_login
        }
        
        # Add student profile if exists
        if hasattr(user, 'studentprofile'):
            user_data['studentprofile'] = {
                'student_id': user.studentprofile.student_id,
                'course': {
                    'title': user.studentprofile.course.title if user.studentprofile.course else None
                } if user.studentprofile.course else None
            }
        
        users_data.append(user_data)
    
    return Response(users_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_faculty_api(request):
    """Create a new faculty user"""
    data = request.data
    
    # Check if username or email already exists
    if User.objects.filter(username=data['username']).exists():
        return Response({'error': 'Username already exists'}, status=400)
    
    if User.objects.filter(email=data['email']).exists():
        return Response({'error': 'Email already exists'}, status=400)
    
    # Create faculty user
    faculty = User.objects.create(
        username=data['username'],
        email=data['email'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        password=make_password(data['password']),
        role='faculty',
        is_active=True,
        is_staff=False
    )
    
    return Response({
        'success': True,
        'message': 'Faculty created successfully',
        'faculty_id': faculty.id
    })

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def toggle_student_status_api(request, student_id):
    """Toggle student active/blocked status"""
    try:
        student = User.objects.get(id=student_id, role='student')
        student.is_active = not student.is_active
        student.save()
        
        return Response({
            'success': True,
            'message': f'Student {"unblocked" if student.is_active else "blocked"} successfully',
            'is_active': student.is_active
        })
        
    except User.DoesNotExist:
        return Response({'error': 'Student not found'}, status=404)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user_api(request, user_id):
    """Delete a user (faculty or student)"""
    try:
        user = User.objects.get(id=user_id)
        user.delete()
        
        return Response({
            'success': True,
            'message': 'User deleted successfully'
        })
        
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_faculty_api(request, faculty_id):
    """Update faculty user information"""
    try:
        faculty = User.objects.get(id=faculty_id, role='faculty')
        data = request.data
        
        # Update fields
        if 'email' in data:
            # Check if email is being changed and if new email already exists
            if data['email'] != faculty.email and User.objects.filter(email=data['email']).exists():
                return Response({'error': 'Email already exists'}, status=400)
            faculty.email = data['email']
        
        if 'first_name' in data:
            faculty.first_name = data['first_name']
        
        if 'last_name' in data:
            faculty.last_name = data['last_name']
        
        if 'password' in data and data['password']:
            faculty.password = make_password(data['password'])
        
        if 'is_active' in data:
            faculty.is_active = data['is_active']
        
        faculty.save()
        
        return Response({
            'success': True,
            'message': 'Faculty updated successfully'
        })
        
    except User.DoesNotExist:
        return Response({'error': 'Faculty not found'}, status=404)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_student_api(request, student_id):
    """Update student user information and profile"""
    try:
        student = User.objects.get(id=student_id, role='student')
        data = request.data
        
        # Update user fields
        if 'email' in data:
            if data['email'] != student.email and User.objects.filter(email=data['email']).exists():
                return Response({'error': 'Email already exists'}, status=400)
            student.email = data['email']
        
        if 'first_name' in data:
            student.first_name = data['first_name']
        
        if 'last_name' in data:
            student.last_name = data['last_name']
        
        if 'password' in data and data['password']:
            student.password = make_password(data['password'])
            
        if 'is_active' in data:
            student.is_active = data['is_active']
            
        student.save()
        
        # Update profile fields if provided
        profile = StudentProfile.objects.filter(user=student).first()
        if profile:
            if 'student_id' in data:
                profile.student_id = data['student_id']
            # Add other profile fields to update as needed
            profile.save()
            
        return Response({
            'success': True,
            'message': 'Student updated successfully'
        })
        
    except User.DoesNotExist:
        return Response({'error': 'Student not found'}, status=404)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def toggle_faculty_status_api(request, faculty_id):
    """Toggle faculty active/blocked status"""
    try:
        faculty = User.objects.get(id=faculty_id, role='faculty')
        faculty.is_active = not faculty.is_active
        faculty.save()
        
        return Response({
            'success': True,
            'message': f'Faculty {"unblocked" if faculty.is_active else "blocked"} successfully',
            'is_active': faculty.is_active
        })
        
    except User.DoesNotExist:
        return Response({'error': 'Faculty not found'}, status=404)
