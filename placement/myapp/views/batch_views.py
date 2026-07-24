from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from myapp.models import Batch, Course, CourseEnrollment, User, StudentProfile

@api_view(['GET'])
@permission_classes([AllowAny])
def list_batches(request):
    """
    List all batches or filter by course.
    Accessible by Admin, Faculty, and Student.
    """
    user = request.user
    course_id = request.GET.get('course_id')
    status_filter = request.GET.get('status')
    search = request.GET.get('search', '').strip()

    queryset = Batch.objects.select_related('course').all()

    if course_id:
        queryset = queryset.filter(course_id=course_id)

    if status_filter:
        queryset = queryset.filter(status=status_filter)

    if search:
        queryset = queryset.filter(
            Q(name__icontains=search) | Q(code__icontains=search) | Q(course__title__icontains=search)
        )

    # Scoping for Faculty: only batches assigned to them
    if user.is_authenticated and user.role == 'faculty':
        from myapp.models import FacultyAssignment
        assigned_batch_ids = FacultyAssignment.objects.filter(faculty=user).values_list('batch_id', flat=True)
        queryset = queryset.filter(id__in=assigned_batch_ids)
    elif user.is_authenticated and user.role == 'student':
        # ONLY return batches the student is enrolled in
        enrolled_batch_ids = CourseEnrollment.objects.filter(user=user, batch__isnull=False).values_list('batch_id', flat=True)
        queryset = queryset.filter(id__in=enrolled_batch_ids)

    data = []
    for b in queryset:
        b_status = b.compute_status()
        data.append({
            "id": b.id,
            "name": b.name,
            "code": b.code,
            "course_id": b.course.id,
            "course_title": b.course.title,
            "timing": b.timing,
            "expected_start_date": b.expected_start_date.strftime("%Y-%m-%d") if b.expected_start_date else None,
            "expected_end_date": b.expected_end_date.strftime("%Y-%m-%d") if b.expected_end_date else None,
            "actual_start_date": b.actual_start_date.strftime("%Y-%m-%d") if b.actual_start_date else None,
            "actual_end_date": b.actual_end_date.strftime("%Y-%m-%d") if b.actual_end_date else None,
            "max_students": b.max_students,
            "current_students": b.enrollments.count(),
            "status": b_status,
            "description": b.description,
            "created_at": b.created_at.strftime("%Y-%m-%d") if b.created_at else None
        })

    return Response({
        "success": True,
        "data": data,
        "count": len(data)
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_batch(request):
    """
    Create a new batch for a course. Admin only.
    """
    user = request.user
    if user.role != 'admin':
        return Response({"detail": "Only Admin can create batches."}, status=status.HTTP_403_FORBIDDEN)

    data = request.data
    name = data.get('name')
    code = data.get('code')
    course_id = data.get('course_id')

    if not name or not code or not course_id:
        return Response({"detail": "name, code, and course_id are required."}, status=status.HTTP_400_BAD_REQUEST)

    if Batch.objects.filter(code=code).exists():
        return Response({"detail": f"Batch code '{code}' already exists."}, status=status.HTTP_400_BAD_REQUEST)

    course = get_object_or_404(Course, id=course_id)

    batch = Batch.objects.create(
        name=name,
        code=code,
        course=course,
        timing=data.get('timing', ''),
        expected_start_date=data.get('expected_start_date') or None,
        expected_end_date=data.get('expected_end_date') or None,
        max_students=data.get('max_students', 30),
        status=data.get('status', 'Upcoming'),
        description=data.get('description', '')
    )

    return Response({
        "success": True,
        "message": f"Batch '{batch.name}' created successfully.",
        "batch_id": batch.id
    }, status=status.HTTP_201_CREATED)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_batch(request, batch_id):
    """
    Update batch details, timelines, and status.
    """
    user = request.user
    if user.role != 'admin':
        return Response({"detail": "Only Admin can manage batches."}, status=status.HTTP_403_FORBIDDEN)

    batch = get_object_or_404(Batch, id=batch_id)
    data = request.data

    if 'name' in data: batch.name = data['name']
    if 'timing' in data: batch.timing = data['timing']
    if 'expected_start_date' in data: batch.expected_start_date = data['expected_start_date'] or None
    if 'expected_end_date' in data: batch.expected_end_date = data['expected_end_date'] or None
    if 'actual_start_date' in data: batch.actual_start_date = data['actual_start_date'] or None
    if 'actual_end_date' in data: batch.actual_end_date = data['actual_end_date'] or None
    if 'max_students' in data: batch.max_students = data['max_students']
    if 'status' in data: batch.status = data['status']
    if 'description' in data: batch.description = data['description']
    if 'code' in data:
        new_code = data['code']
        if new_code != batch.code and Batch.objects.filter(code=new_code).exists():
            return Response({"detail": f"Batch code '{new_code}' already exists."}, status=status.HTTP_400_BAD_REQUEST)
        batch.code = new_code
    if 'course_id' in data:
        course = get_object_or_404(Course, id=data['course_id'])
        batch.course = course

    batch.save()

    return Response({
        "success": True,
        "message": f"Batch '{batch.name}' updated successfully."
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_batch_students(request, batch_id):
    """
    List all students enrolled in a specific batch.
    """
    user = request.user
    batch = get_object_or_404(Batch, id=batch_id)

    # Scoping
    if user.role == 'faculty':
        from myapp.models import FacultyAssignment
        if not FacultyAssignment.objects.filter(faculty=user, batch=batch).exists():
            return Response({"detail": "You are not assigned to this batch."}, status=status.HTTP_403_FORBIDDEN)

    enrollments = CourseEnrollment.objects.filter(batch=batch).select_related('user')

    data = []
    for e in enrollments:
        profile = StudentProfile.objects.filter(user=e.user).first()
        data.append({
            "user_id": e.user.id,
            "username": e.user.username,
            "email": e.user.email,
            "student_id": profile.student_id if profile else None,
            "enrolled_at": e.enrolled_at.strftime("%Y-%m-%d") if e.enrolled_at else None,
            "status": e.status,
            "progress": e.progress,
            "approval_status": profile.approval_status if profile else 'pending'
        })

    return Response({
        "success": True,
        "batch_name": batch.name,
        "students": data,
        "total": len(data)
    })

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_batch(request, batch_id):
    """
    Delete a batch. Admin & Faculty only.
    """
    user = request.user
    if user.role != 'admin':
        return Response({"detail": "Only Admin can delete batches."}, status=status.HTTP_403_FORBIDDEN)

    batch = get_object_or_404(Batch, id=batch_id)
    batch_name = batch.name
    batch.delete()

    return Response({
        "success": True,
        "message": f"Batch '{batch_name}' deleted successfully."
    })
