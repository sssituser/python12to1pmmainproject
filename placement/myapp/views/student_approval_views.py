from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from myapp.models import StudentProfile, User
from django.db.models import Q
from django.core.paginator import Paginator

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_student_approvals(request):
    """
    List student profiles with details for approval screen.
    Accessible by Admin and Faculty.
    """
    user = request.user
    if user.role not in ['admin', 'faculty']:
        return Response({"detail": "Only admin and faculty can access the Student Approval panel."}, status=status.HTTP_403_FORBIDDEN)
    
    # Query parameters
    search = request.GET.get('search', '').strip()
    status_filter = request.GET.get('status', '').strip()
    sort_by = request.GET.get('sort_by', 'user__date_joined').strip()
    order = request.GET.get('order', 'desc').strip()
    page = request.GET.get('page', 1)
    page_size = request.GET.get('page_size', 10)
    
    queryset = StudentProfile.objects.all().select_related('user', 'approved_by', 'course')
    
    if search:
        queryset = queryset.filter(
            Q(user__username__icontains=search) |
            Q(user__email__icontains=search) |
            Q(student_id__icontains=search)
        )
        
    if status_filter:
        queryset = queryset.filter(approval_status=status_filter)
        
    # Sorting
    if sort_by in ['username', 'user__username']:
        prefix = '-' if order == 'desc' else ''
        queryset = queryset.order_by(f"{prefix}user__username")
    elif sort_by in ['student_id', 'studentId']:
        prefix = '-' if order == 'desc' else ''
        queryset = queryset.order_by(f"{prefix}student_id")
    elif sort_by in ['registered_course', 'course__title']:
        prefix = '-' if order == 'desc' else ''
        queryset = queryset.order_by(f"{prefix}course__title")
    else: # Default registration date
        prefix = '-' if order == 'desc' else ''
        queryset = queryset.order_by(f"{prefix}user__date_joined")
        
    # Pagination
    paginator = Paginator(queryset, page_size)
    try:
        current_page = paginator.page(page)
    except Exception:
        current_page = paginator.page(1)
        
    data = []
    for profile in current_page:
        data.append({
            "id": profile.id,
            "username": profile.user.username,
            "student_id": profile.student_id,
            "email": profile.user.email,
            "registered_course": profile.course.title if profile.course else "None",
            "registration_date": profile.user.date_joined.strftime("%Y-%m-%d %H:%M:%S") if profile.user.date_joined else "N/A",
            "status": profile.approval_status,
            "approved_by": profile.approved_by.username if profile.approved_by else None,
            "approved_at": profile.approved_at.strftime("%Y-%m-%d %H:%M:%S") if profile.approved_at else None,
            "rejection_reason": profile.rejection_reason or ""
        })
        
    return Response({
        "success": True,
        "data": data,
        "pagination": {
            "page": current_page.number,
            "pages": paginator.num_pages,
            "total": paginator.count
        }
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_student(request, profile_id):
    """
    Approve a student account registration.
    """
    user = request.user
    if user.role not in ['admin', 'faculty']:
        return Response({"detail": "Only admin and faculty can approve student accounts."}, status=status.HTTP_403_FORBIDDEN)
        
    try:
        profile = StudentProfile.objects.get(id=profile_id)
    except StudentProfile.DoesNotExist:
        return Response({"detail": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)
        
    profile.approval_status = 'approved'
    profile.approved_by = user
    profile.approved_at = timezone.now()
    profile.rejection_reason = None
    profile.save(update_fields=['approval_status', 'approved_by', 'approved_at', 'rejection_reason'])
    
    # Assign batch if batch_id provided
    batch_id = request.data.get('batch_id')
    if batch_id:
        from myapp.models import Batch, CourseEnrollment
        batch_obj = Batch.objects.filter(id=batch_id).first()
        if batch_obj:
            enrollment, _ = CourseEnrollment.objects.get_or_create(user=profile.user, course=batch_obj.course)
            enrollment.batch = batch_obj
            enrollment.save(update_fields=['batch'])

    # Also activate the base user
    base_user = profile.user
    if not base_user.is_active:
        base_user.is_active = True
        base_user.save(update_fields=['is_active'])

    # Send approval email notification in background thread
    if base_user.email:
        try:
            import threading
            from myapp.email_utils import send_student_approval_email
            threading.Thread(
                target=send_student_approval_email,
                args=(base_user.email, base_user.username)
            ).start()
        except Exception as email_err:
            print(f"Error triggering approval email thread: {email_err}")

    return Response({
        "success": True,
        "message": f"Student registration for '{base_user.username}' has been approved."
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_student(request, profile_id):
    """
    Reject a student account registration.
    """
    user = request.user
    if user.role not in ['admin', 'faculty']:
        return Response({"detail": "Only admin and faculty can reject student accounts."}, status=status.HTTP_403_FORBIDDEN)
        
    try:
        profile = StudentProfile.objects.get(id=profile_id)
    except StudentProfile.DoesNotExist:
        return Response({"detail": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)
        
    rejection_reason = request.data.get('rejection_reason', '').strip()
    
    profile.approval_status = 'rejected'
    profile.approved_by = user
    profile.approved_at = timezone.now()
    profile.rejection_reason = rejection_reason
    profile.save(update_fields=['approval_status', 'approved_by', 'approved_at', 'rejection_reason'])
    
    base_user = profile.user
    base_user.is_active = False
    base_user.save(update_fields=['is_active'])
    
    # Send rejection email notification in background thread
    if base_user.email:
        try:
            import threading
            from myapp.email_utils import send_student_rejection_email
            threading.Thread(
                target=send_student_rejection_email,
                args=(base_user.email, base_user.username, rejection_reason)
            ).start()
        except Exception as email_err:
            print(f"Error triggering rejection email thread: {email_err}")

    return Response({
        "success": True,
        "message": f"Student registration for '{base_user.username}' has been rejected."
    })
