"""
Scheduled background tasks for auto-deletion of login emails.
Runs periodically to clean up old login emails for ALL users.
No modifications to existing code required - this is a standalone module.
"""

import logging
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from myapp.models import LoginEmailLog
from myapp.imap_utils import attempt_delete_excess_login_emails

logger = logging.getLogger(__name__)

User = get_user_model()


def cleanup_all_user_login_emails():
    """
    Background task: Clean up login emails for ALL users.
    
    This function:
    1. Gets all users who have login email logs
    2. For each user, runs the existing cleanup logic
    3. Logs results without stopping on errors
    
    Safe to call multiple times; runs independently of user activity.
    """
    logger.info("Starting scheduled login email cleanup for all users...")
    
    try:
        # Get all users with login email logs
        users_with_logs = User.objects.filter(
            login_email_logs__isnull=False
        ).distinct()
        
        total_users = users_with_logs.count()
        logger.info(f"Found {total_users} users with login email logs")
        
        if total_users == 0:
            logger.info("No users to process for email cleanup")
            return {
                'success': True,
                'message': 'No users to process',
                'users_processed': 0,
                'total_deleted': 0
            }
        
        users_processed = 0
        total_deleted = 0
        users_failed = 0
        
        # Process each user
        for user in users_with_logs:
            try:
                # Check if user has email (for IMAP deletion)
                user_email = getattr(user, 'email', None) or getattr(user, 'user_email', None)
                
                if not user_email:
                    logger.warning(f"No email found for user {user.username}, skipping IMAP deletion")
                    user_email = None
                
                # Run the existing cleanup logic
                cleanup_result = attempt_delete_excess_login_emails(
                    user=user,
                    user_email=user_email,
                    email_password=None  # Will use config if available
                )
                
                deleted_count = cleanup_result.get('deleted_count', 0) if cleanup_result else 0
                total_deleted += deleted_count
                
                if cleanup_result and cleanup_result.get('success'):
                    logger.info(
                        f"✓ Cleaned up user {user.username}: "
                        f"{deleted_count} deleted, remaining: {cleanup_result.get('active_after_cleanup', 'N/A')}"
                    )
                else:
                    logger.warning(
                        f"⚠ Cleanup for {user.username} had issues: "
                        f"{cleanup_result.get('message', 'Unknown error') if cleanup_result else 'No result'}"
                    )
                    users_failed += 1
                
                users_processed += 1
                
            except Exception as e:
                logger.error(f"✗ Error cleaning up emails for user {user.username}: {str(e)}")
                users_failed += 1
                users_processed += 1
                continue
        
        message = f"Cleanup completed: {users_processed}/{total_users} users processed, {total_deleted} total emails deleted"
        if users_failed > 0:
            message += f", {users_failed} users had issues"
        
        logger.info(message)
        
        return {
            'success': users_failed == 0,
            'message': message,
            'users_processed': users_processed,
            'users_failed': users_failed,
            'total_deleted': total_deleted
        }
    
    except Exception as e:
        error_msg = f"Fatal error in cleanup_all_user_login_emails: {str(e)}"
        logger.error(error_msg)
        return {
            'success': False,
            'message': error_msg,
            'users_processed': 0,
            'total_deleted': 0
        }


# Optional: Management command to manually trigger cleanup
class Command(BaseCommand):
    """
    Django management command to trigger email cleanup manually.
    Usage: python manage.py cleanup_login_emails
    """
    help = 'Manually trigger cleanup of old login emails for all users'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting manual email cleanup...'))
        
        result = cleanup_all_user_login_emails()
        
        if result['success']:
            self.stdout.write(
                self.style.SUCCESS(f"✓ {result['message']}")
            )
        else:
            self.stdout.write(
                self.style.WARNING(f"⚠ {result['message']}")
            )
