from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from myapp.models import AdminNotification


def _require_admin(request):
    """Return True if request user is admin/staff, else False."""
    user = request.user
    if not user or not user.is_authenticated:
        return False
    if getattr(user, 'is_superuser', False) or getattr(user, 'is_staff', False):
        return True
    role = str(getattr(user, 'role', '')).lower().strip()
    return role in ['admin', 'superuser', 'staff']


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_notifications(request):
    """List all admin notifications (most recent first)."""
    if not _require_admin(request):
        return Response({'error': 'Admin access required.'}, status=403)

    try:
        limit = int(request.GET.get('limit', 50))
        notifications = AdminNotification.objects.all().order_by('-created_at')[:limit]

        data = [
            {
                'id': n.id,
                'notification_type': n.notification_type,
                'title': n.title,
                'message': n.message,
                'is_read': n.is_read,
                'related_username': n.related_username,
                'related_email': n.related_email,
                'created_at': n.created_at.isoformat() if n.created_at else None,
            }
            for n in notifications
        ]
        unread_count = AdminNotification.objects.filter(is_read=False).count()

        return Response({'notifications': data, 'unread_count': unread_count})
    except Exception as e:
        print(f"Error in list_notifications: {e}")
        return Response({'notifications': [], 'unread_count': 0}, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_count(request):
    """Return just the unread count (lightweight for polling)."""
    try:
        if not _require_admin(request):
            return Response({'unread_count': 0}, status=200)

        count = AdminNotification.objects.filter(is_read=False).count()
        return Response({'unread_count': count})
    except Exception as e:
        print(f"Error in unread_count: {e}")
        return Response({'unread_count': 0}, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_read(request, notification_id):
    """Mark a single notification as read."""
    if not _require_admin(request):
        return Response({'error': 'Admin access required.'}, status=403)

    try:
        notification = AdminNotification.objects.get(id=notification_id)
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        return Response({'success': True})
    except AdminNotification.DoesNotExist:
        return Response({'error': 'Notification not found.'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_read(request):
    """Mark all notifications as read."""
    if not _require_admin(request):
        return Response({'error': 'Admin access required.'}, status=403)

    updated = AdminNotification.objects.filter(is_read=False).update(is_read=True)
    return Response({'success': True, 'marked_read': updated})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_notification(request, notification_id):
    """Delete a single notification."""
    if not _require_admin(request):
        return Response({'error': 'Admin access required.'}, status=403)

    try:
        AdminNotification.objects.get(id=notification_id).delete()
        return Response({'success': True})
    except AdminNotification.DoesNotExist:
        return Response({'error': 'Notification not found.'}, status=404)
