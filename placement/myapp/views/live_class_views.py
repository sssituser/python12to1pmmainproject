from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from myapp.models import LiveClassSession, Course, Batch, CourseModule, CourseEnrollment, FacultyAssignment

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_live_classes(request):
    """
    List live classes. 
    Students see classes for their assigned batches.
    Faculty see classes for their assigned batches/modules.
    Admin sees all classes.
    """
    user = request.user
    batch_id = request.GET.get('batch_id')
    status_filter = request.GET.get('status')

    queryset = LiveClassSession.objects.select_related('course', 'batch', 'module', 'faculty').all()

    if user.role == 'student':
        student_batch_ids = CourseEnrollment.objects.filter(user=user, batch__isnull=False).values_list('batch_id', flat=True)
        queryset = queryset.filter(batch_id__in=student_batch_ids)
    elif user.role == 'faculty':
        faculty_batch_ids = FacultyAssignment.objects.filter(faculty=user).values_list('batch_id', flat=True)
        queryset = queryset.filter(batch_id__in=faculty_batch_ids)

    if batch_id:
        queryset = queryset.filter(batch_id=batch_id)

    if status_filter:
        queryset = queryset.filter(status=status_filter)

    data = []
    for session in queryset:
        data.append({
            "id": session.id,
            "title": session.title,
            "course_id": session.course.id,
            "course_title": session.course.title,
            "batch_id": session.batch.id,
            "batch_name": session.batch.name,
            "module_id": session.module.id if session.module else None,
            "module_name": session.module.name if session.module else "All Modules",
            "topic": session.topic,
            "faculty_name": session.faculty.get_full_name() or session.faculty.username,
            "meeting_link": session.meeting_link,
            "meeting_id": session.meeting_id,
            "start_time": session.start_time.strftime("%Y-%m-%d %H:%M"),
            "end_time": session.end_time.strftime("%Y-%m-%d %H:%M") if session.end_time else None,
            "status": session.status,
            "recording_url": session.recording_url,
            "created_at": session.created_at.strftime("%Y-%m-%d")
        })

    return Response({
        "success": True,
        "data": data,
        "count": len(data)
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_live_class(request):
    """
    Schedule a new live class. Admin & Faculty only.
    """
    user = request.user
    if user.role not in ['admin', 'faculty']:
        return Response({"detail": "Only Admin or Faculty can schedule live classes."}, status=status.HTTP_403_FORBIDDEN)

    data = request.data
    title = data.get('title')
    course_id = data.get('course_id')
    batch_id = data.get('batch_id')
    meeting_link = data.get('meeting_link')
    start_time = data.get('start_time')

    if not title or not course_id or not batch_id or not meeting_link or not start_time:
        return Response({"detail": "title, course_id, batch_id, meeting_link, and start_time are required."}, status=status.HTTP_400_BAD_REQUEST)

    course = get_object_or_404(Course, id=course_id)
    batch = get_object_or_404(Batch, id=batch_id, course=course)
    module_id = data.get('module_id')
    module = get_object_or_404(CourseModule, id=module_id, course=course) if module_id else None

    session = LiveClassSession.objects.create(
        title=title,
        course=course,
        batch=batch,
        module=module,
        topic=data.get('topic', ''),
        faculty=user,
        meeting_link=meeting_link,
        meeting_id=data.get('meeting_id', ''),
        start_time=start_time,
        status=data.get('status', 'Scheduled'),
        recording_url=data.get('recording_url', '')
    )

    return Response({
        "success": True,
        "message": f"Live class '{session.title}' scheduled successfully.",
        "session_id": session.id
    }, status=status.HTTP_201_CREATED)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_live_class(request, session_id):
    """
    Update live class status or attach recording URL.
    """
    user = request.user
    if user.role not in ['admin', 'faculty']:
        return Response({"detail": "Only Admin or Faculty can update live classes."}, status=status.HTTP_403_FORBIDDEN)

    session = get_object_or_404(LiveClassSession, id=session_id)
    data = request.data

    if 'status' in data: session.status = data['status']
    if 'recording_url' in data: session.recording_url = data['recording_url']
    if 'meeting_link' in data: session.meeting_link = data['meeting_link']
    if 'end_time' in data: session.end_time = data['end_time']

    session.save()

    return Response({
        "success": True,
        "message": f"Live class '{session.title}' updated successfully."
    })
