from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from myapp.models import StudentProfile, User, StudentAuditLog
from django.db.models import Q
from django.core.paginator import Paginator


def log_student_audit(student_name, action_type, action_title, performed_by="System", student_email="", student_id_val=None, user_id=None, details=""):
    try:
        StudentAuditLog.objects.create(
            user_id=user_id,
            student_name=student_name or 'Student',
            student_email=student_email or '',
            student_id_val=str(student_id_val) if (student_id_val is not None and str(student_id_val) != 'None') else '',
            action_type=action_type,
            action_title=action_title,
            performed_by=performed_by or 'System',
            details=details or ''
        )
    except Exception as e:
        print(f"Error logging student audit: {e}")


def _auto_seed_audit_logs():
    """Seed audit logs from existing profiles if StudentAuditLog is empty."""
    try:
        if StudentAuditLog.objects.count() == 0:
            profiles = StudentProfile.objects.select_related('user', 'approved_by', 'course').all()
            for p in profiles:
                u = p.user
                u_name = f"{u.first_name} {u.last_name}".strip() or u.username
                
                # Seed registration event
                StudentAuditLog.objects.create(
                    user_id=u.id,
                    student_name=u_name,
                    student_email=u.email or '',
                    student_id_val=str(p.student_id) if p.student_id else str(u.id),
                    action_type='registration',
                    action_title='Student Registered',
                    performed_by=u.username,
                    details=f"Course: {p.course.title if p.course else 'Aptitude and Reasoning'}",
                    created_at=u.date_joined or timezone.now()
                )

                # Seed approval/rejection event if status set
                if p.approval_status in ['approved', 'rejected']:
                    StudentAuditLog.objects.create(
                        user_id=u.id,
                        student_name=u_name,
                        student_email=u.email or '',
                        student_id_val=str(p.student_id) if p.student_id else str(u.id),
                        action_type=p.approval_status,
                        action_title=f"Account {p.approval_status.capitalize()}",
                        performed_by=p.approved_by.username if p.approved_by else 'Admin',
                        details=p.rejection_reason if p.approval_status == 'rejected' else f"Assigned Course: {p.course.title if p.course else 'Default'}",
                        created_at=p.approved_at or timezone.now()
                    )
    except Exception as e:
        print(f"Error auto-seeding audit logs: {e}")


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_student_approvals(request):
    """
    List student profiles and complete audit log history for approval screen.
    Accessible by Admin and Faculty.
    """
    user = request.user
    if user.role not in ['admin', 'faculty'] and not user.is_staff and not user.is_superuser:
        return Response({
            "success": True,
            "data": [],
            "pagination": {"total": 0, "page": 1, "page_size": 10, "pages": 1},
            "message": "Student approval panel is restricted to administrative staff."
        })
    
    _auto_seed_audit_logs()

    # Query parameters
    search = request.GET.get('search', '').strip()
    status_filter = request.GET.get('status', '').strip()
    sort_by = request.GET.get('sort_by', 'user__date_joined').strip()
    order = request.GET.get('order', 'desc').strip()
    page = request.GET.get('page', 1)
    page_size = request.GET.get('page_size', 10)
    
    # Delete any accidentally created StudentProfile objects for admin/faculty users
    StudentProfile.objects.filter(user__role__in=['admin', 'faculty']).delete()

    queryset = StudentProfile.objects.filter(user__role='student').select_related('user', 'approved_by', 'course')
    
    if search:
        queryset = queryset.filter(
            Q(user__username__icontains=search) |
            Q(user__email__icontains=search) |
            Q(student_id__icontains=search)
        )
        
    if status_filter and status_filter.lower() != 'all':
        statuses = [s.strip().lower() for s in status_filter.split(',') if s.strip() and s.strip().lower() != 'all']
        if len(statuses) == 1:
            queryset = queryset.filter(approval_status=statuses[0])
        elif len(statuses) > 1:
            queryset = queryset.filter(approval_status__in=statuses)
        
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
        user_obj = profile.user
        data.append({
            "id": profile.id,
            "user_id": user_obj.id,
            "username": user_obj.username,
            "first_name": user_obj.first_name or "",
            "last_name": user_obj.last_name or "",
            "full_name": f"{user_obj.first_name or ''} {user_obj.last_name or ''}".strip() or user_obj.username,
            "student_id": profile.student_id or user_obj.id,
            "studentId": profile.student_id or user_obj.id,
            "email": user_obj.email or "",
            "registered_course": profile.course.title if profile.course else "Aptitude and Reasoning",
            "registration_date": user_obj.date_joined.strftime("%Y-%m-%d %H:%M:%S") if user_obj.date_joined else "N/A",
            "status": profile.approval_status,
            "approval_status": profile.approval_status,
            "approved_by": profile.approved_by.username if profile.approved_by else None,
            "approved_at": profile.approved_at.strftime("%Y-%m-%d %H:%M:%S") if profile.approved_at else None,
            "rejection_reason": profile.rejection_reason or ""
        })
        
    # Also fetch audit log entries
    audit_logs_data = []
    try:
        audit_qs = StudentAuditLog.objects.all().order_by('-created_at')[:100]
        if search:
            audit_qs = audit_qs.filter(
                Q(student_name__icontains=search) |
                Q(student_email__icontains=search) |
                Q(student_id_val__icontains=search) |
                Q(action_title__icontains=search) |
                Q(details__icontains=search)
            )
        for log in audit_qs:
            audit_logs_data.append({
                "id": f"audit_{log.id}",
                "user_id": log.user_id,
                "student_name": log.student_name,
                "full_name": log.student_name,
                "student_email": log.student_email,
                "email": log.student_email,
                "student_id": log.student_id_val or "N/A",
                "action_type": log.action_type,
                "action_title": log.action_title,
                "performed_by": log.performed_by,
                "details": log.details or "",
                "created_at": log.created_at.strftime("%Y-%m-%d %H:%M:%S") if log.created_at else "N/A",
                "action_date": log.created_at.strftime("%Y-%m-%d %H:%M:%S") if log.created_at else "N/A"
            })
    except Exception as a_err:
        print(f"Error fetching audit logs: {a_err}")

    return Response({
        "success": True,
        "data": data,
        "audit_logs": audit_logs_data,
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

    # Log approval audit record
    u_name = f"{base_user.first_name} {base_user.last_name}".strip() or base_user.username
    log_student_audit(
        student_name=u_name,
        action_type='approved',
        action_title='Registration Approved',
        performed_by=user.username,
        student_email=base_user.email,
        student_id_val=profile.student_id or base_user.id,
        user_id=base_user.id,
        details=f"Account approved by {user.username}"
    )

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
    
    # Log rejection audit record
    u_name = f"{base_user.first_name} {base_user.last_name}".strip() or base_user.username
    log_student_audit(
        student_name=u_name,
        action_type='rejected',
        action_title='Registration Rejected',
        performed_by=user.username,
        student_email=base_user.email,
        student_id_val=profile.student_id or base_user.id,
        user_id=base_user.id,
        details=f"Reason: {rejection_reason or 'No reason specified'}"
    )

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
