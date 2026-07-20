from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from myapp.models import AdminNotification


def _require_admin(request):
    """Return True if request user is admin, else False."""
    user = request.user
    return user and user.is_authenticated and getattr(user, 'role', '') == 'admin'


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_notifications(request):
    """List all admin notifications (most recent first)."""
    if not _require_admin(request):
        return Response({'error': 'Admin access required.'}, status=403)

    limit = int(request.GET.get('limit', 50))
    notifications = AdminNotification.objects.all()[:limit]

    data = [
        {
            'id': n.id,
            'notification_type': n.notification_type,
            'title': n.title,
            'message': n.message,
            'is_read': n.is_read,
            'related_username': n.related_username,
            'related_email': n.related_email,
            'created_at': n.created_at.isoformat(),
        }
        for n in notifications
    ]
    unread_count = AdminNotification.objects.filter(is_read=False).count()

    return Response({'notifications': data, 'unread_count': unread_count})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_count(request):
    """Return just the unread count (lightweight for polling)."""
    if not _require_admin(request):
        return Response({'error': 'Admin access required.'}, status=403)

    count = AdminNotification.objects.filter(is_read=False).count()
    return Response({'unread_count': count})


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
