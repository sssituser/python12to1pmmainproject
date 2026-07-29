from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from myapp.models import FacultyAssignment, User, Course, Batch, CourseModule

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_faculty_assignments(request):
    """
    List faculty assignments. Admin sees all, Faculty sees own.
    """
    user = request.user
    if user.role == 'student':
        return Response({"detail": "Students cannot view faculty assignments."}, status=status.HTTP_403_FORBIDDEN)

    queryset = FacultyAssignment.objects.select_related('faculty', 'course', 'batch', 'module').all()

    if user.role == 'faculty':
        queryset = queryset.filter(faculty=user)

    data = []
    for fa in queryset:
        data.append({
            "id": fa.id,
            "faculty_id": fa.faculty.id,
            "faculty_name": fa.faculty.get_full_name() or fa.faculty.username,
            "faculty_email": fa.faculty.email,
            "course_id": fa.course.id,
            "course_title": fa.course.title,
            "batch_id": fa.batch.id,
            "batch_name": fa.batch.name,
            "batch_code": fa.batch.code,
            "module_id": fa.module.id if fa.module else None,
            "module_name": fa.module.name if fa.module else "All Modules",
            "assigned_at": fa.assigned_at.strftime("%Y-%m-%d %H:%M:%S") if fa.assigned_at else None
        })

    return Response({
        "success": True,
        "data": data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_faculty_module(request):
    """
    Assign a faculty member to Course -> Batch -> Module. Admin only.
    """
    user = request.user
    if user.role != 'admin':
        return Response({"detail": "Only Admin can assign faculty to modules."}, status=status.HTTP_403_FORBIDDEN)

    data = request.data
    faculty_id = data.get('faculty_id')
    course_id = data.get('course_id')
    batch_id = data.get('batch_id')
    module_id = data.get('module_id')

    if not faculty_id or not course_id or not batch_id:
        return Response({"detail": "faculty_id, course_id, and batch_id are required."}, status=status.HTTP_400_BAD_REQUEST)

    faculty_user = get_object_or_404(User, id=faculty_id, role='faculty')
    course_obj = get_object_or_404(Course, id=course_id)
    batch_obj = get_object_or_404(Batch, id=batch_id, course=course_obj)
    module_obj = get_object_or_404(CourseModule, id=module_id, course=course_obj) if module_id else None

    # Check if assignment already exists
    if FacultyAssignment.objects.filter(faculty=faculty_user, batch=batch_obj, module=module_obj).exists():
        return Response({"detail": "Faculty is already assigned to this batch module."}, status=status.HTTP_400_BAD_REQUEST)

    assignment = FacultyAssignment.objects.create(
        faculty=faculty_user,
        course=course_obj,
        batch=batch_obj,
        module=module_obj
    )

    batch_obj.faculty = faculty_user
    batch_obj.save(update_fields=['faculty'])

    return Response({
        "success": True,
        "message": f"Faculty '{faculty_user.username}' assigned to batch '{batch_obj.name}'.",
        "assignment_id": assignment.id
    }, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_faculty_assignment(request, assignment_id):
    """
    Remove a faculty module assignment. Admin only.
    """
    user = request.user
    if user.role != 'admin':
        return Response({"detail": "Only Admin can remove faculty assignments."}, status=status.HTTP_403_FORBIDDEN)

    assignment = get_object_or_404(FacultyAssignment, id=assignment_id)
    assignment.delete()

    return Response({
        "success": True,
        "message": "Faculty assignment removed successfully."
    })
