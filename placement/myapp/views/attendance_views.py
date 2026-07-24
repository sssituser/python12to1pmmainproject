from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import datetime
from myapp.models import Attendance, Batch, User, CourseEnrollment

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_batch_attendance(request, batch_id):
    """
    Get attendance for a batch on a specific date.
    """
    user = request.user
    batch = get_object_or_404(Batch, id=batch_id)
    date_str = request.GET.get('date', timezone.now().strftime('%Y-%m-%d'))

    try:
        query_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return Response({"detail": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

    # RBAC Scoping
    if user.role == 'faculty':
        from myapp.models import FacultyAssignment
        if not FacultyAssignment.objects.filter(faculty=user, batch=batch).exists():
            return Response({"detail": "You are not assigned to this batch."}, status=status.HTTP_403_FORBIDDEN)
    elif user.role == 'student':
        if not CourseEnrollment.objects.filter(user=user, batch=batch).exists():
            return Response({"detail": "You are not enrolled in this batch."}, status=status.HTTP_403_FORBIDDEN)

    records = Attendance.objects.filter(batch=batch, date=query_date).select_related('student', 'marked_by')
    marked_map = {r.student_id: r for r in records}

    # Fetch all students in batch
    enrollments = CourseEnrollment.objects.filter(batch=batch).select_related('user')
    if user.role == 'student':
        enrollments = enrollments.filter(user=user)

    data = []
    for e in enrollments:
        student_user = e.user
        rec = marked_map.get(student_user.id)
        data.append({
            "student_id": student_user.id,
            "username": student_user.username,
            "name": student_user.get_full_name() or student_user.username,
            "email": student_user.email,
            "status": rec.status if rec else "Unmarked",
            "remarks": rec.remarks if rec else "",
            "marked_by": rec.marked_by.username if rec and rec.marked_by else None
        })

    return Response({
        "success": True,
        "batch_id": batch.id,
        "batch_name": batch.name,
        "date": date_str,
        "records": data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_batch_attendance(request):
    """
    Bulk mark attendance for a batch on a date. Faculty & Admin only.
    """
    user = request.user
    if user.role not in ['admin', 'faculty']:
        return Response({"detail": "Only Admin or Faculty can mark attendance."}, status=status.HTTP_403_FORBIDDEN)

    data = request.data
    batch_id = data.get('batch_id')
    date_str = data.get('date')
    records = data.get('records', []) # list of {student_id, status, remarks}

    if not batch_id or not date_str or not isinstance(records, list):
        return Response({"detail": "batch_id, date, and records list are required."}, status=status.HTTP_400_BAD_REQUEST)

    batch = get_object_or_404(Batch, id=batch_id)

    if user.role == 'faculty':
        from myapp.models import FacultyAssignment
        if not FacultyAssignment.objects.filter(faculty=user, batch=batch).exists():
            return Response({"detail": "You are not assigned to this batch."}, status=status.HTTP_403_FORBIDDEN)

    try:
        attendance_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return Response({"detail": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

    saved_count = 0
    for item in records:
        student_id = item.get('student_id')
        att_status = item.get('status', 'Present')
        remarks = item.get('remarks', '')

        if not student_id: continue

        student_user = User.objects.filter(id=student_id).first()
        if not student_user: continue

        Attendance.objects.update_or_create(
            student=student_user,
            batch=batch,
            date=attendance_date,
            defaults={
                'status': att_status,
                'remarks': remarks,
                'marked_by': user
            }
        )
        saved_count += 1

    return Response({
        "success": True,
        "message": f"Attendance for {saved_count} students saved successfully.",
        "date": date_str
    })
