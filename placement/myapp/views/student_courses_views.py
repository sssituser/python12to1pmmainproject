from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from myapp.models import Course, CourseEnrollment, StudentProfile, User, StudentTopicProgress, CourseTopic
from django.shortcuts import get_object_or_404
from django.db import IntegrityError

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_student_courses(request, student_id=None):
    """
    Get all courses a student is enrolled in.
    Students can only fetch their own. Admin/Faculty can fetch any student's courses.
    """
    user = request.user
    
    # Identify target user
    if student_id:
        if user.role not in ['admin', 'faculty']:
            return Response({"detail": "You do not have permission to view other students' courses."}, status=status.HTTP_403_FORBIDDEN)
        target_user = get_object_or_404(User, id=student_id)
    else:
        target_user = user
        if target_user.role != 'student':
            return Response({"detail": "Only students have enrolled courses."}, status=status.HTTP_400_BAD_REQUEST)

    enrollments = CourseEnrollment.objects.filter(user=target_user).select_related('course')
    
    # Auto-sync profile course to CourseEnrollment if not present
    profile = StudentProfile.objects.filter(user=target_user).first()
    if profile and profile.course:
        enrollment_course_ids = [e.course.id for e in enrollments if e.course]
        if profile.course.id not in enrollment_course_ids:
            try:
                CourseEnrollment.objects.get_or_create(
                    user=target_user,
                    course=profile.course,
                    defaults={'status': 'Active', 'progress': 0, 'completion_percentage': 0.0}
                )
                enrollments = CourseEnrollment.objects.filter(user=target_user).select_related('course')
            except Exception as e:
                print(f"Error auto-enrolling student: {e}")
                
    data = []
    for enrollment in enrollments:
        data.append({
            "enrollment_id": enrollment.id,
            "course_id": enrollment.course.id,
            "title": enrollment.course.title,
            "level": enrollment.course.level,
            "duration": enrollment.course.duration,
            "enrolled_at": enrollment.enrolled_at.strftime("%Y-%m-%d") if enrollment.enrolled_at else None,
            "status": enrollment.status,
            "progress": enrollment.progress,
            "completion_percentage": enrollment.completion_percentage,
            "batch_id": enrollment.batch.id if enrollment.batch else None,
            "batch_name": enrollment.batch.name if enrollment.batch else "Unassigned",
            "is_eligible_for_certificate": enrollment.is_eligible_for_certificate,
            "is_locked": enrollment.is_locked
        })
        
    return Response({
        "success": True,
        "data": data,
        "message": "Student courses retrieved successfully."
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_course(request):
    """
    Assign a course to a student.
    Only accessible by Admin and Faculty.
    """
    user = request.user
    if user.role not in ['admin', 'faculty']:
        return Response({"detail": "Only Admin or Faculty can assign courses."}, status=status.HTTP_403_FORBIDDEN)
        
    student_id = request.data.get('student_id')
    course_id = request.data.get('course_id')
    
    if not student_id or not course_id:
        return Response({"detail": "student_id and course_id are required."}, status=status.HTTP_400_BAD_REQUEST)
        
    student_user = get_object_or_404(User, id=student_id)
    course_obj = get_object_or_404(Course, id=course_id)
    
    # Check if already enrolled
    if CourseEnrollment.objects.filter(user=student_user, course=course_obj).exists():
        return Response({"detail": "Student is already enrolled in this course."}, status=status.HTTP_400_BAD_REQUEST)
        
    batch_id = request.data.get('batch_id')
    batch_obj = None
    if batch_id:
        from myapp.models import Batch
        batch_obj = Batch.objects.filter(id=batch_id).first()

    try:
        enrollment = CourseEnrollment.objects.create(
            user=student_user,
            course=course_obj,
            batch=batch_obj,
            status='Active',
            progress=0,
            completion_percentage=0.0
        )
        
        # Sync to StudentProfile.course if none is set
        profile = StudentProfile.objects.filter(user=student_user).first()
        if profile and not profile.course:
            profile.course = course_obj
            profile.save(update_fields=['course'])

        # Trigger course enrollment notification email in background thread
        if student_user.email:
            try:
                import threading
                from myapp.email_utils import send_course_enrollment_email
                threading.Thread(
                    target=send_course_enrollment_email,
                    args=(student_user.email, student_user.username, course_obj.title)
                ).start()
            except Exception as email_err:
                print(f"Error triggering course enrollment email thread: {email_err}")
            
        return Response({
            "success": True,
            "message": f"Course '{course_obj.title}' assigned successfully.",
            "data": {
                "enrollment_id": enrollment.id,
                "course_id": course_obj.id,
                "title": course_obj.title
            }
        })
    except IntegrityError:
        return Response({"detail": "Enrollment already exists or database constraint failed."}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_course(request):
    """
    Remove a course enrollment from a student.
    Only accessible by Admin and Faculty.
    """
    user = request.user
    if user.role not in ['admin', 'faculty']:
        return Response({"detail": "Only Admin or Faculty can remove courses."}, status=status.HTTP_403_FORBIDDEN)
        
    student_id = request.data.get('student_id')
    course_id = request.data.get('course_id')
    
    if not student_id or not course_id:
        return Response({"detail": "student_id and course_id are required."}, status=status.HTTP_400_BAD_REQUEST)
        
    student_user = get_object_or_404(User, id=student_id)
    course_obj = get_object_or_404(Course, id=course_id)
    
    enrollment = CourseEnrollment.objects.filter(user=student_user, course=course_obj).first()
    if not enrollment:
        return Response({"detail": "Enrollment not found."}, status=status.HTTP_404_NOT_FOUND)
        
    enrollment.delete()
    
    # Clean up StudentProfile.course reference if it was this course
    profile = StudentProfile.objects.filter(user=student_user).first()
    if profile and profile.course == course_obj:
        next_enrollment = CourseEnrollment.objects.filter(user=student_user).first()
        profile.course = next_enrollment.course if next_enrollment else None
        profile.save(update_fields=['course'])
        
    return Response({
        "success": True,
        "message": f"Course '{course_obj.title}' removed successfully."
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_available_courses(request):
    """
    Get list of all available courses for enrollment.
    """
    courses = Course.objects.all().order_by('title')
    data = []
    for course in courses:
        data.append({
            "id": course.id,
            "title": course.title,
            "level": course.level,
            "duration": course.duration
        })
    return Response({
        "success": True,
        "data": data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_course_progress(request, course_id):
    """
    Calculate and get progress of the authenticated student in a specific course.
    """
    user = request.user
    if user.role != 'student':
        return Response({"detail": "Only students have course progress."}, status=status.HTTP_400_BAD_REQUEST)
        
    course_obj = get_object_or_404(Course, id=course_id)
    enrollment = get_object_or_404(CourseEnrollment, user=user, course=course_obj)
    
    # Calculate progress dynamically based on completed topics
    total_topics = CourseTopic.objects.filter(course=course_obj).count()
    completed_topics = StudentTopicProgress.objects.filter(
        enrollment=enrollment, 
        is_completed=True
    ).count()
    
    progress_percentage = 0.0
    if total_topics > 0:
        progress_percentage = round((completed_topics / total_topics) * 100, 2)
        
    # Update enrollment record
    enrollment.progress = int(progress_percentage)
    enrollment.completion_percentage = progress_percentage
    enrollment.is_eligible_for_certificate = progress_percentage >= 80.0  # Certificate eligibility strategy e.g. >=80%
    enrollment.save(update_fields=['progress', 'completion_percentage', 'is_eligible_for_certificate'])
    
    return Response({
        "success": True,
        "data": {
            "course_id": course_id,
            "title": course_obj.title,
            "total_topics": total_topics,
            "completed_topics": completed_topics,
            "progress_percentage": progress_percentage,
            "is_eligible_for_certificate": enrollment.is_eligible_for_certificate
        }
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_enrollment_batch(request):
    """
    Change or assign a batch for an existing course enrollment.
    Only accessible by Admin and Faculty.
    """
    user = request.user
    if user.role not in ['admin', 'faculty']:
        return Response({"detail": "Only Admin or Faculty can manage enrollment batches."}, status=status.HTTP_403_FORBIDDEN)
        
    student_id = request.data.get('student_id')
    course_id = request.data.get('course_id')
    batch_id = request.data.get('batch_id') # Can be null/None to unassign
    
    if not student_id or not course_id:
        return Response({"detail": "student_id and course_id are required."}, status=status.HTTP_400_BAD_REQUEST)
        
    student_user = get_object_or_404(User, id=student_id)
    course_obj = get_object_or_404(Course, id=course_id)
    
    enrollment = CourseEnrollment.objects.filter(user=student_user, course=course_obj).first()
    if not enrollment:
        return Response({"detail": "Enrollment not found."}, status=status.HTTP_404_NOT_FOUND)
        
    batch_obj = None
    if batch_id:
        from myapp.models import Batch
        batch_obj = Batch.objects.filter(id=batch_id).first()
        if batch_obj and batch_obj.course_id != course_obj.id:
            return Response({"detail": f"Batch '{batch_obj.name}' does not belong to course '{course_obj.title}'."}, status=status.HTTP_400_BAD_REQUEST)
            
    enrollment.batch = batch_obj
    enrollment.save(update_fields=['batch'])
    
    return Response({
        "success": True,
        "message": f"Updated batch for '{course_obj.title}' to '{batch_obj.name if batch_obj else 'Unassigned'}'.",
        "data": {
            "enrollment_id": enrollment.id,
            "course_id": course_obj.id,
            "batch_id": batch_id,
            "batch_name": batch_obj.name if batch_obj else None
        }
    })
