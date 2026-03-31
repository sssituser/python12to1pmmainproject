"""
Management command to manually trigger login email cleanup.
Usage: python manage.py cleanup_login_emails
"""

from django.core.management.base import BaseCommand
from myapp.scheduled_tasks import cleanup_all_user_login_emails


class Command(BaseCommand):
    help = 'Manually trigger cleanup of old login emails for all users'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting manual email cleanup...'))
        
        result = cleanup_all_user_login_emails()
        
        if result['success']:
            self.stdout.write(
                self.style.SUCCESS(f"✓ Success: {result['message']}")
            )
        else:
            self.stdout.write(
                self.style.WARNING(f"⚠ Warning: {result['message']}")
            )
        
        self.stdout.write(
            self.style.SUCCESS(f"\nDetails:")
        )
        self.stdout.write(f"  Users processed: {result.get('users_processed', 0)}")
        self.stdout.write(f"  Users failed: {result.get('users_failed', 0)}")
        self.stdout.write(f"  Total deleted: {result.get('total_deleted', 0)}")
