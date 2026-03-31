"""
APScheduler configuration for automated background tasks.
This runs scheduled tasks without needing Celery or additional services.
Attach to Django startup in apps.py using ready() method.
"""

import os
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()


def start_scheduler():
    """
    Initialize and start the background scheduler.
    Called automatically from myapp/apps.py AppConfig.ready()
    
    NOTE: Scheduled auto-deletion is DISABLED to avoid 2 AM UTC cleanup.
    Faculty users only: Auto-deletion happens IMMEDIATELY on login (not scheduled).
    """
    if scheduler.running:
        logger.info("Scheduler already running")
        return
    
    try:
        # Get configuration from environment variables
        cleanup_enabled = os.environ.get('LOGIN_EMAIL_CLEANUP_TASK_ENABLED', 'false').lower() == 'true'
        cleanup_hour = int(os.environ.get('LOGIN_EMAIL_CLEANUP_HOUR', '2'))  # Default: 2 AM UTC
        cleanup_minute = int(os.environ.get('LOGIN_EMAIL_CLEANUP_MINUTE', '0'))
        
        if not cleanup_enabled:
            logger.info("✓ Email cleanup scheduled task is DISABLED (faculty users only get immediate on-login cleanup)")
            return
        
        # Import the task here to avoid circular imports
        from myapp.scheduled_tasks import cleanup_all_user_login_emails
        
        # Schedule the task to run daily
        scheduler.add_job(
            func=cleanup_all_user_login_emails,
            trigger=CronTrigger(hour=cleanup_hour, minute=cleanup_minute),
            id='cleanup_login_emails_daily',
            name='Clean up old login emails for all users',
            replace_existing=True,  # Prevent duplicates if restarted
            misfire_grace_time=300,  # 5 minute grace period
        )
        
        scheduler.start()
        logger.info(
            f"✓ APScheduler started. "
            f"Email cleanup scheduled daily at {cleanup_hour:02d}:{cleanup_minute:02d} UTC"
        )
        
    except Exception as e:
        logger.error(f"Error starting scheduler: {str(e)}")


def stop_scheduler():
    """Stop the scheduler (called on Django shutdown)"""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("✓ APScheduler stopped")
