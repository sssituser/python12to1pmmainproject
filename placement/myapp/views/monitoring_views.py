"""
Monitoring endpoints to show auto-deletion status to users.
Allows users to see their login email logs and deletion history.
No modifications to existing code - standalone monitoring views.
"""

import logging
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from myapp.models import LoginEmailLog

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_login_email_status(request):
    """
    Get current status of user's login emails and auto-deletion.
    
    Response:
    {
        "active_emails": 5,
        "deleted_emails": 30,
        "total_emails": 35,
        "threshold": 30,
        "auto_deletion_enabled": true,
        "last_deletion": "2026-03-29T02:00:00Z",
        "status": "Clean - Below threshold"
    }
    
    Usage: GET /api/login-email-status/
    """
    user = request.user
    
    try:
        # Get counts
        active_emails = LoginEmailLog.objects.filter(
            user=user, 
            is_deleted=False
        ).count()
        
        deleted_emails = LoginEmailLog.objects.filter(
            user=user, 
            is_deleted=True
        ).count()
        
        total_emails = active_emails + deleted_emails
        
        # Get last deletion timestamp
        last_deletion = LoginEmailLog.objects.filter(
            user=user,
            is_deleted=True,
            deleted_at__isnull=False
        ).order_by('-deleted_at').first()
        
        last_deletion_date = last_deletion.deleted_at if last_deletion else None
        
        # Configuration threshold
        from myapp.imap_utils import _get_cleanup_config
        config = _get_cleanup_config()
        threshold = config.get('threshold', 30)
        
        # Determine status
        if active_emails >= threshold:
            status_msg = f"⚠️ High - {active_emails}/{threshold} emails (cleanup triggered)"
            is_urgent = True
        elif active_emails >= (threshold * 0.8):
            status_msg = f"⚡ Alert - {active_emails}/{threshold} emails (approaching threshold)"
            is_urgent = False
        else:
            status_msg = f"✓ Clean - {active_emails}/{threshold} emails (below threshold)"
            is_urgent = False
        
        return Response({
            'success': True,
            'data': {
                'active_emails': active_emails,
                'deleted_emails': deleted_emails,
                'total_emails': total_emails,
                'threshold': threshold,
                'auto_deletion_enabled': config.get('enabled', True),
                'last_deletion': last_deletion_date,
                'status': status_msg,
                'is_urgent': is_urgent,
                'next_scheduled_cleanup': '02:00 UTC (daily)'
            }
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Error fetching login email status for user {user.username}: {str(e)}")
        return Response({
            'success': False,
            'message': f'Error fetching status: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_login_email_history(request):
    """
    Get detailed history of user's login emails with deletion status.
    
    Response:
    {
        "emails": [
            {
                "id": 1,
                "email_address": "user@example.com",
                "sent_at": "2026-03-28T15:30:00Z",
                "is_deleted": false,
                "deleted_at": null,
                "login_time": "15:30",
                "browser_info": "Chrome on Windows",
                "status": "Active"
            },
            {
                "id": 2,
                "email_address": "user@example.com",
                "sent_at": "2026-03-27T10:15:00Z",
                "is_deleted": true,
                "deleted_at": "2026-03-29T02:00:00Z",
                "login_time": "10:15",
                "browser_info": "Firefox on macOS",
                "status": "Deleted by auto-cleanup"
            }
        ],
        "pagination": {
            "total": 35,
            "limit": 10,
            "offset": 0
        }
    }
    
    Usage: GET /api/login-email-history/?limit=10&offset=0
    """
    user = request.user
    
    try:
        # Get pagination params
        limit = int(request.query_params.get('limit', 10))
        offset = int(request.query_params.get('offset', 0))
        
        # Limit to reasonable values
        limit = min(limit, 100)
        
        # Get email logs (newest first)
        all_emails = LoginEmailLog.objects.filter(user=user).order_by('-sent_at')
        total_count = all_emails.count()
        
        emails = all_emails[offset:offset+limit]
        
        email_list = []
        for email_log in emails:
            email_data = {
                'id': email_log.id,
                'email_address': email_log.email_address,
                'sent_at': email_log.sent_at.isoformat() if email_log.sent_at else None,
                'is_deleted': email_log.is_deleted,
                'deleted_at': email_log.deleted_at.isoformat() if email_log.deleted_at else None,
                'login_time': email_log.login_time,
                'browser_info': email_log.browser_info,
                'user_ip': email_log.user_ip,
                'status': 'Deleted by auto-cleanup' if email_log.is_deleted else 'Active'
            }
            email_list.append(email_data)
        
        return Response({
            'success': True,
            'emails': email_list,
            'pagination': {
                'total': total_count,
                'limit': limit,
                'offset': offset,
                'has_more': (offset + limit) < total_count
            }
        }, status=status.HTTP_200_OK)
    
    except ValueError as e:
        return Response({
            'success': False,
            'message': 'Invalid pagination parameters'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"Error fetching login email history for user {user.username}: {str(e)}")
        return Response({
            'success': False,
            'message': f'Error fetching history: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_auto_deletion_info(request):
    """
    Get information about how auto-deletion works.
    
    Response:
    {
        "how_it_works": "Auto-deletion removes old login confirmation emails...",
        "threshold": 30,
        "batch_size": 30,
        "schedule": "Daily at 02:00 UTC",
        "what_happens": "Oldest emails are soft-deleted from database and optionally from email inbox",
        "why": "To keep your login email inbox clean and manageable"
    }
    
    Usage: GET /api/auto-deletion-info/
    """
    try:
        from myapp.imap_utils import _get_cleanup_config
        config = _get_cleanup_config()
        
        return Response({
            'success': True,
            'data': {
                'how_it_works': (
                    'Auto-deletion automatically removes your old login confirmation emails '
                    'when you accumulate too many of them. This keeps your email inbox clean '
                    'and organized without you having to manually delete anything.'
                ),
                'threshold': config.get('threshold', 30),
                'batch_size': config.get('batch_size', 30),
                'schedule': 'Daily at 02:00 UTC (automatically)',
                'what_happens': (
                    'When you have more login emails than the threshold, '
                    'the oldest emails are automatically deleted from the database. '
                    'If IMAP is enabled, they are also deleted from your email inbox.'
                ),
                'why': 'To keep your login email inbox clean and manageable',
                'is_enabled': config.get('enabled', True),
                'imap_enabled': config.get('imap_enabled', False),
                'note': 'This only affects login confirmation emails, not other messages'
            }
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Error fetching auto-deletion info: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error fetching information'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
