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
        role_val = (getattr(user, 'role', '') or '').lower()
        is_admin_or_faculty = role_val in ['admin', 'faculty'] or user.is_staff or user.is_superuser
        if not is_admin_or_faculty:
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
            "batch_code": enrollment.batch.code if enrollment.batch else "Unassigned",
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
    Assign one or more courses to a student.
    Only accessible by Admin and Faculty.
    """
    user = request.user
    role_val = (getattr(user, 'role', '') or '').lower()
    is_admin_or_faculty = role_val in ['admin', 'faculty'] or user.is_staff or user.is_superuser
    if not is_admin_or_faculty:
        return Response({"detail": "Only Admin or Faculty can assign courses."}, status=status.HTTP_403_FORBIDDEN)
        
    student_id = request.data.get('student_id')
    course_ids = request.data.get('course_ids', [])
    course_id = request.data.get('course_id')
    
    if not course_ids and course_id:
        course_ids = [course_id]
        
    if not student_id or not course_ids:
        return Response({"detail": "student_id and course_ids are required."}, status=status.HTTP_400_BAD_REQUEST)
        
    student_user = get_object_or_404(User, id=student_id)
    
    batch_id = request.data.get('batch_id')
    batch_map = request.data.get('batch_map', {}) # { course_id: batch_id }
    
    from myapp.models import StudentProfile, Course, CourseEnrollment, Batch

    # 1. Un-enroll courses that were unchecked by admin
    CourseEnrollment.objects.filter(user=student_user).exclude(course_id__in=course_ids).delete()

    assigned_titles = []
    already_enrolled = []

    # 2. Add / update selected course enrollments
    for c_id in course_ids:
        course_obj = Course.objects.filter(id=c_id).first()
        if not course_obj:
            continue
        
        target_batch_id = batch_map.get(str(c_id)) if batch_map else batch_id
        batch_obj = Batch.objects.filter(id=target_batch_id).first() if target_batch_id else None
        
        enrollment, created = CourseEnrollment.objects.get_or_create(
            user=student_user,
            course=course_obj,
            defaults={
                'batch': batch_obj if (batch_obj and batch_obj.course_id == course_obj.id) else None,
                'status': 'Active',
                'progress': 0,
                'completion_percentage': 0.0
            }
        )
        if not created and target_batch_id is not None:
            enrollment.batch = batch_obj if (batch_obj and batch_obj.course_id == course_obj.id) else None
            enrollment.save(update_fields=['batch'])
            
        if created:
            assigned_titles.append(course_obj.title)
        else:
            already_enrolled.append(course_obj.title)

        # Trigger course enrollment notification email in background thread
        if created and student_user.email:
            try:
                import threading
                from myapp.email_utils import send_course_enrollment_email
                threading.Thread(
                    target=send_course_enrollment_email,
                    args=(student_user.email, student_user.username, course_obj.title)
                ).start()
            except Exception as email_err:
                print(f"Error triggering course enrollment email thread: {email_err}")

    # 3. Keep StudentProfile.course updated to active enrollment
    latest_enrollment = CourseEnrollment.objects.filter(user=student_user).first()
    profile = StudentProfile.objects.filter(user=student_user).first()
    if profile:
        profile.course = latest_enrollment.course if latest_enrollment else None
        profile.save(update_fields=['course'])

    return Response({
        "success": True,
        "message": f"Student courses updated successfully ({len(course_ids)} course(s) assigned)."
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_course(request):
    """
    Remove a course enrollment from a student.
    Only accessible by Admin and Faculty.
    """
    user = request.user
    role_val = (getattr(user, 'role', '') or '').lower()
    is_admin_or_faculty = role_val in ['admin', 'faculty'] or user.is_staff or user.is_superuser
    if not is_admin_or_faculty:
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
            "batch_name": batch_obj.name if batch_obj else None,
            "batch_code": batch_obj.code if batch_obj else None
        }
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_student_course_progress(request):
    """
    Update the course progress percentage for the authenticated student.
    """
    user = request.user
    if user.role != 'student':
        return Response({"detail": "Only students can update course progress."}, status=status.HTTP_400_BAD_REQUEST)
        
    course_id = request.data.get('course_id')
    progress = request.data.get('progress')
    
    if course_id is None or progress is None:
        return Response({"detail": "course_id and progress are required."}, status=status.HTTP_400_BAD_REQUEST)
        
    course_obj = get_object_or_404(Course, id=course_id)
    enrollment = get_object_or_404(CourseEnrollment, user=user, course=course_obj)
    
    try:
        progress_val = int(progress)
        if progress_val < 0 or progress_val > 100:
            return Response({"detail": "Progress must be between 0 and 100."}, status=status.HTTP_400_BAD_REQUEST)
            
        enrollment.progress = progress_val
        enrollment.completion_percentage = float(progress_val)
        enrollment.is_eligible_for_certificate = progress_val >= 80
        enrollment.save(update_fields=['progress', 'completion_percentage', 'is_eligible_for_certificate'])
        
        return Response({
            "success": True,
            "message": f"Course progress updated to {progress_val}%.",
            "data": {
                "course_id": course_id,
                "progress": progress_val
            }
        })
    except ValueError:
        return Response({"detail": "Invalid progress value."}, status=status.HTTP_400_BAD_REQUEST)
