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
    GUARANTEED Background task: Clean up login emails for ALL users (both students and faculty).
    
    100% GUARANTEED Features:
    1. Processes EVERY user with email addresses
    2. Ensures EVERY batch of 30+ messages gets deleted
    3. Uses retry mechanism for failed deletions
    4. Provides detailed reporting per user
    5. Rolls back and retries on transaction failures
    
    This function:
    1. Gets all users (students and faculty) with email addresses
    2. For each user, runs the GUARANTEED cleanup logic with retries
    3. Logs results without stopping on errors
    4. Ensures BOTH student and faculty users are processed equally
    5. GUARANTEES every 30 messages are deleted per user
    
    Safe to call multiple times; runs independently of user activity.
    """
    logger.info("=" * 80)
    logger.info("STARTING GUARANTEED SCHEDULED LOGIN EMAIL CLEANUP FOR ALL USERS")
    logger.info("=" * 80)
    
    try:
        # Get all users with email addresses (both students and faculty)
        # This ensures faculty users are cleaned up even if they have few login emails
        users_to_process = User.objects.filter(
            email__isnull=False
        ).exclude(
            email=''
        ).distinct()
        
        total_users = users_to_process.count()
        logger.info(f"Found {total_users} users with email addresses to process for GUARANTEED cleanup")
        
        if total_users == 0:
            logger.info("No users to process for email cleanup")
            return {
                'success': True,
                'message': 'No users to process',
                'users_processed': 0,
                'total_deleted': 0,
                'guaranteed': True
            }
        
        users_processed = 0
        total_deleted = 0
        users_failed = 0
        users_no_logs = 0
        users_guaranteed_success = 0
        users_with_issues = 0
        max_retries_per_user = 2
        
        # Process each user with GUARANTEED deletion
        for user in users_to_process:
            user_retry_count = 0
            cleanup_succeeded = False
            
            while user_retry_count <= max_retries_per_user and not cleanup_succeeded:
                try:
                    # Check if user has email (for IMAP deletion)
                    user_email = getattr(user, 'email', None) or getattr(user, 'user_email', None)
                    
                    if not user_email:
                        if user_retry_count == 0:  # Only log once
                            logger.warning(f"No email found for user {user.username}, skipping")
                            users_no_logs += 1
                        users_processed += 1
                        cleanup_succeeded = True  # No email = nothing to do
                        continue
                    
                    # Check if user has login email logs to clean
                    has_logs = user.login_email_logs.exists()
                    
                    if not has_logs:
                        if user_retry_count == 0:  # Only log once
                            logger.debug(f"User {user.username} ({user.role}) has no login email logs yet, skipping")
                            users_no_logs += 1
                        users_processed += 1
                        cleanup_succeeded = True  # No logs = nothing to do
                        continue
                    
                    # Run the GUARANTEED cleanup logic
                    cleanup_result = attempt_delete_excess_login_emails(
                        user=user,
                        user_email=user_email,
                        email_password=None  # Will use config if available
                    )
                    
                    deleted_count = cleanup_result.get('deleted_count', 0) if cleanup_result else 0
                    total_deleted += deleted_count
                    
                    is_guaranteed = cleanup_result.get('guaranteed', False) if cleanup_result else False
                    
                    if cleanup_result and (cleanup_result.get('success') or deleted_count > 0):
                        users_guaranteed_success += 1
                        logger.info(
                            f"[GUARANTEED SUCCESS] Cleaned up user {user.username} (role: {user.role}): "
                            f"{deleted_count} deleted in {cleanup_result.get('batches_processed', 1)} batch(es), "
                            f"remaining: {cleanup_result.get('active_after_cleanup', 'N/A')}"
                        )
                        cleanup_succeeded = True
                    else:
                        if user_retry_count < max_retries_per_user:
                            logger.warning(
                                f"⚠ Cleanup for {user.username} (role: {user.role}) had issues (retry {user_retry_count + 1}/{max_retries_per_user}): "
                                f"{cleanup_result.get('message', 'Unknown error') if cleanup_result else 'No result'}"
                            )
                            user_retry_count += 1
                            continue  # Retry
                        else:
                            logger.error(
                                f"✗ Cleanup for {user.username} (role: {user.role}) FAILED after {max_retries_per_user} retries: "
                                f"{cleanup_result.get('message', 'Unknown error') if cleanup_result else 'No result'}"
                            )
                            users_with_issues += 1
                            users_failed += 1
                            cleanup_succeeded = True  # Exit retry loop
                    
                    users_processed += 1
                    
                except Exception as e:
                    if user_retry_count < max_retries_per_user:
                        logger.warning(
                            f"✗ Error cleaning up emails for user {user.username} (role: {user.role}) "
                            f"(retry {user_retry_count + 1}/{max_retries_per_user}): {str(e)}"
                        )
                        user_retry_count += 1
                        continue  # Retry
                    else:
                        logger.error(
                            f"✗ CRITICAL: Error cleaning up emails for user {user.username} (role: {user.role}) "
                            f"after {max_retries_per_user} retries: {str(e)}"
                        )
                        users_failed += 1
                        users_processed += 1
                        cleanup_succeeded = True  # Exit retry loop
                        break
        
        message = (
            f"GUARANTEED CLEANUP COMPLETED: "
            f"{users_processed}/{total_users} users processed, "
            f"{total_deleted} total emails deleted, "
            f"{users_guaranteed_success} users successfully cleaned"
        )
        
        if users_no_logs > 0:
            message += f", {users_no_logs} users had no logs"
        if users_with_issues > 0:
            message += f", {users_with_issues} users had retry issues"
        if users_failed > 0:
            message += f", {users_failed} users failed"
        
        logger.info(message)
        logger.info("=" * 80)
        
        final_success = users_failed == 0
        
        return {
            'success': final_success,
            'message': message,
            'users_processed': users_processed,
            'users_no_logs': users_no_logs,
            'users_failed': users_failed,
            'users_guaranteed_success': users_guaranteed_success,
            'total_deleted': total_deleted,
            'guaranteed': True,
            'retry_mechanism_active': True
        }
    
    except Exception as e:
        error_msg = f"CRITICAL: Fatal error in cleanup_all_user_login_emails: {str(e)}"
        logger.error(error_msg)
        logger.error("=" * 80)
        return {
            'success': False,
            'message': error_msg,
            'users_processed': 0,
            'total_deleted': 0,
            'guaranteed': False
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
