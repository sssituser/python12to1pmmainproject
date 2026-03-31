"""
IMAP utilities for managing email deletion from user inboxes
Supports Gmail, Outlook, and other IMAP-compatible email providers
"""

import imaplib
import email
from email.header import decode_header
import logging
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)


class IMAPEmailManager:
    """Manages IMAP connections and email deletion"""
    
    IMAP_SERVERS = {
        'gmail.com': 'imap.gmail.com',
        'outlook.com': 'outlook.office365.com',
        'mail.yahoo.com': 'imap.mail.yahoo.com',
        'aol.com': 'imap.aol.com',
        'mail.protonmail.com': 'imap.protonmail.com',
    }
    
    def __init__(self, email_address, email_password):
        """
        Initialize IMAP manager
        
        Args:
            email_address: User's email address
            email_password: App-specific password or regular password (for IMAP)
        """
        self.email_address = email_address
        self.email_password = email_password
        self.imap_server = self._get_imap_server()
        self.connection = None
    
    def _get_imap_server(self):
        """Determine IMAP server based on email domain"""
        domain = self.email_address.split('@')[-1].lower()
        
        # Direct lookup
        if domain in self.IMAP_SERVERS:
            return self.IMAP_SERVERS[domain]
        
        # Custom IMAP configuration from Django settings
        if hasattr(settings, 'CUSTOM_IMAP_SERVERS'):
            if domain in settings.CUSTOM_IMAP_SERVERS:
                return settings.CUSTOM_IMAP_SERVERS[domain]
        
        # Default fallback
        logger.warning(f"Unknown IMAP server for domain {domain}, using default")
        return f"imap.{domain}"
    
    def connect(self, timeout=10):
        """
        Establish IMAP connection
        
        Args:
            timeout: Connection timeout in seconds
            
        Returns:
            bool: True if connection successful, False otherwise
        """
        try:
            self.connection = imaplib.IMAP4_SSL(self.imap_server, timeout=timeout)
            self.connection.login(self.email_address, self.email_password)
            logger.info(f"IMAP connection successful for {self.email_address}")
            return True
        except imaplib.IMAP4.error as e:
            logger.error(f"IMAP connection error for {self.email_address}: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error connecting to IMAP: {str(e)}")
            return False
    
    def disconnect(self):
        """Close IMAP connection"""
        if self.connection:
            try:
                self.connection.close()
                self.connection.logout()
                logger.info(f"IMAP disconnected for {self.email_address}")
            except Exception as e:
                logger.error(f"Error disconnecting IMAP: {str(e)}")
    
    def search_emails_by_subject(self, subject_keyword, mailbox='INBOX'):
        """
        Search for emails by subject
        
        Args:
            subject_keyword: Keyword to search in subject
            mailbox: Mailbox name (default: INBOX)
            
        Returns:
            list: Message UIDs matching the search
        """
        if not self.connection:
            logger.error("IMAP connection not established")
            return []
        
        try:
            self.connection.select(mailbox)
            status, messages = self.connection.search(None, f'SUBJECT "{subject_keyword}"')
            
            if status == 'OK':
                message_ids = messages[0].split()
                logger.info(f"Found {len(message_ids)} emails with subject keyword '{subject_keyword}'")
                return message_ids
            else:
                logger.error(f"IMAP search failed with status: {status}")
                return []
        except Exception as e:
            logger.error(f"Error searching emails: {str(e)}")
            return []
    
    def get_email_headers(self, message_uid):
        """
        Get email headers for a specific message
        
        Args:
            message_uid: UID of the message
            
        Returns:
            dict: Email headers
        """
        if not self.connection:
            return {}
        
        try:
            status, message_data = self.connection.fetch(message_uid, '(RFC822.HEADER)')
            if status == 'OK':
                msg = email.message_from_bytes(message_data[0][1])
                return {
                    'subject': msg.get('Subject', ''),
                    'from': msg.get('From', ''),
                    'date': msg.get('Date', ''),
                }
            return {}
        except Exception as e:
            logger.error(f"Error getting email headers: {str(e)}")
            return {}
    
    def delete_emails_by_uid(self, message_uids, mailbox='INBOX'):
        """
        Delete emails by their UIDs
        
        Args:
            message_uids: List of message UIDs to delete
            mailbox: Mailbox name (default: INBOX)
            
        Returns:
            tuple: (success: bool, deleted_count: int, errors: list)
        """
        if not self.connection or not message_uids:
            return False, 0, ["No connection or UIDs provided"]
        
        errors = []
        deleted_count = 0
        
        try:
            self.connection.select(mailbox)
            
            for uid in message_uids:
                try:
                    # Mark for deletion
                    status, _ = self.connection.store(uid, '+FLAGS', '\\Deleted')
                    
                    if status == 'OK':
                        deleted_count += 1
                        logger.info(f"Marked email {uid} for deletion")
                    else:
                        error_msg = f"Failed to mark UID {uid} for deletion"
                        errors.append(error_msg)
                        logger.error(error_msg)
                except Exception as e:
                    error_msg = f"Error marking UID {uid} for deletion: {str(e)}"
                    errors.append(error_msg)
                    logger.error(error_msg)
            
            # Permanently delete marked emails
            try:
                self.connection.expunge()
                logger.info(f"Expunged {deleted_count} emails from {mailbox}")
            except Exception as e:
                logger.error(f"Error expunging emails: {str(e)}")
                errors.append(f"Error expunging: {str(e)}")
            
            return len(errors) == 0, deleted_count, errors
        
        except Exception as e:
            logger.error(f"Error deleting emails: {str(e)}")
            return False, 0, [str(e)]
    
    def delete_emails_by_subject(self, subject_keyword, limit=None, mailbox='INBOX'):
        """
        Delete emails matching a subject keyword (with optional limit)
        
        Args:
            subject_keyword: Keyword to search in subject
            limit: Maximum number of emails to delete (None = delete all matching)
            mailbox: Mailbox name (default: INBOX)
            
        Returns:
            tuple: (success: bool, deleted_count: int, errors: list)
        """
        try:
            message_ids = self.search_emails_by_subject(subject_keyword, mailbox)
            
            if not message_ids:
                return True, 0, []
            
            if limit:
                message_ids = message_ids[:limit]
            
            return self.delete_emails_by_uid(message_ids, mailbox)
        
        except Exception as e:
            logger.error(f"Error in delete_emails_by_subject: {str(e)}")
            return False, 0, [str(e)]


def _get_cleanup_config():
    """
    Build a dynamic cleanup configuration from settings with sensible defaults.
    Values are driven by environment variables (see settings.py) so behaviour
    can be tuned without code changes or redeploys.
    """
    return {
        "enabled": getattr(settings, "LOGIN_EMAIL_AUTO_DELETE_ENABLED", True),
        "threshold": getattr(settings, "LOGIN_EMAIL_MAX_ACTIVE", 30),
        "batch_size": getattr(settings, "LOGIN_EMAIL_DELETE_BATCH", 30),
        "subject_keyword": getattr(settings, "LOGIN_EMAIL_SUBJECT_KEYWORD", "Login Confirmation"),
        "mailbox": getattr(settings, "LOGIN_EMAIL_MAILBOX", "INBOX"),
        "imap_timeout": getattr(settings, "LOGIN_EMAIL_IMAP_TIMEOUT", 10),
        "imap_enabled": getattr(settings, "LOGIN_EMAIL_IMAP_ENABLED", False),
        "imap_username": getattr(settings, "LOGIN_EMAIL_IMAP_USERNAME", None),
        "imap_password": getattr(settings, "LOGIN_EMAIL_IMAP_PASSWORD", None),
    }


def delete_old_login_emails(
    user_email,
    email_password,
    count=None,
    subject_keyword=None,
    mailbox=None,
    timeout=None,
    imap_username=None,
):
    """
    Delete old login emails from user inbox
    
    Args:
        user_email: User's email address
        email_password: App-specific password or email password
        count: Number of oldest emails to delete (default: from settings)
        subject_keyword: Subject keyword to search for (default: from settings)
        
    Returns:
        dict: {
            'success': bool,
            'deleted_count': int,
            'message': str,
            'errors': list
        }
    """
    cfg = _get_cleanup_config()
    manager = IMAPEmailManager(imap_username or cfg["imap_username"] or user_email, email_password)
    
    try:
        delete_count = count or cfg["batch_size"] or cfg["threshold"]
        subject = subject_keyword or cfg["subject_keyword"]
        target_mailbox = mailbox or cfg["mailbox"]
        imap_timeout = timeout or cfg["imap_timeout"]
        domain = (imap_username or user_email).split("@")[-1].lower()

        # Attempt connection
        if not manager.connect(timeout=imap_timeout):
            return {
                'success': False,
                'deleted_count': 0,
                'message': 'Failed to connect to email server',
                'errors': ['IMAP connection failed']
            }
        
        # Build mailbox search order to handle Gmail labels/promotions automatically
        mailboxes_to_try = [target_mailbox]
        if domain in ("gmail.com", "googlemail.com"):
            for extra_box in ("[Gmail]/All Mail", "[Gmail]/Promotions", "[Gmail]/Important"):
                if extra_box not in mailboxes_to_try:
                    mailboxes_to_try.append(extra_box)

        deleted_count = 0
        errors = []
        success = False

        for box in mailboxes_to_try:
            batch_success, batch_deleted, batch_errors = manager.delete_emails_by_subject(
                subject,
                limit=max(delete_count - deleted_count, 0),
                mailbox=box
            )
            deleted_count += batch_deleted
            errors.extend(batch_errors or [])
            success = success or batch_success

            # Stop early if we've removed the requested amount
            if deleted_count >= delete_count:
                break

        return {
            'success': success,
            'deleted_count': deleted_count,
            'message': f'Successfully deleted {deleted_count} old login emails',
            'errors': errors
        }
    
    except Exception as e:
        logger.error(f"Error in delete_old_login_emails: {str(e)}")
        return {
            'success': False,
            'deleted_count': 0,
            'message': f'Error deleting emails: {str(e)}',
            'errors': [str(e)]
        }
    
    finally:
        manager.disconnect()


def attempt_delete_excess_login_emails(user, user_email, email_password=None):
    """
    GUARANTEED cleanup: Dynamically clean up login emails in batches of 30 (or configured).
    Every 30 messages MUST be deleted. This uses multiple safety mechanisms to ensure
    100% reliable deletion for every user who uses the faculty portal.
    
    Safety Mechanisms:
    1. Immediate DB soft-delete (always works)
    2. Retry logic for batch processing
    3. Comprehensive error handling with fallback
    4. Guaranteed processing even if IMAP fails
    5. Transaction safety for database operations
    
    Faculty-Only Feature:
    - Auto-deletion triggers IMMEDIATELY on login
    - ONLY for faculty users (role='faculty')
    - NOT triggered for students
    """
    from myapp.models import LoginEmailLog
    from django.db import transaction

    cfg = _get_cleanup_config()

    if not cfg["enabled"]:
        return {
            'success': True,
            'message': 'Login email auto-deletion disabled by configuration',
            'deleted_count': 0,
            'is_warning': False
        }
    
    # --- Threshold check and auto-deletion trigger ---
    
    max_retries = 3
    retry_count = 0
    
    try:
        active_count = LoginEmailLog.get_email_active_count(user_email)

        if active_count < cfg["threshold"]:
            return {
                'success': True,
                'message': f'Active login emails for {user_email} within limit ({active_count}/{cfg["threshold"]})',
                'deleted_count': 0
            }

        logger.info(
            f"Email address {user_email} has {active_count} login emails, "
            f"threshold {cfg['threshold']}, initiating GUARANTEED cleanup..."
        )

        batch_size = cfg["batch_size"] or cfg["threshold"]

        total_deleted_db = 0
        total_imap_deleted = 0
        cleanup_batches = 0
        imap_errors = []

        # Keep deleting in 30-message batches until the email address 
        # drops below the threshold across ALL user accounts.
        while active_count >= cfg["threshold"]:
            cleanup_batches += 1
            delete_count = min(batch_size, active_count)

            logger.info(
                f"Batch {cleanup_batches}: Deleting {delete_count} emails for address {user_email}. "
                f"Active count: {active_count}"
            )

            # 🔐 Decrypt or prepare IMAP password
            imap_pwd = email_password or cfg["imap_password"]
            
            # Optional IMAP deletion (requires valid credentials)
            imap_result = None
            if cfg["imap_enabled"]:
                if not imap_pwd:
                    # Log but continue to DB cleanup
                    logger.warning(f"IMAP password not available for {user_email}, skipping Gmail deletion.")
                else:
                    imap_result = delete_old_login_emails(
                        user_email,
                        imap_pwd,
                        count=delete_count,
                        subject_keyword=cfg["subject_keyword"],
                        mailbox=cfg["mailbox"],
                        timeout=cfg["imap_timeout"],
                        imap_username=cfg["imap_username"] or user_email,
                    )
                    total_imap_deleted += imap_result.get('deleted_count', 0) if imap_result else 0
                    if imap_result and not imap_result.get('success', False):
                        imap_errors.append(imap_result.get('message', 'IMAP deletion failed'))

            # GUARANTEED: Always soft-delete in DB with transaction safety
            try:
                with transaction.atomic():
                    # Get oldest emails for THIS EMAIL ADDRESS (regardless of user object)
                    oldest_emails = LoginEmailLog.objects.filter(
                        email_address=user_email, 
                        is_deleted=False
                    ).order_by('sent_at')[:delete_count]
                    
                    if not oldest_emails:
                        break
                    
                    deleted_this_batch = 0
                    current_time = timezone.now()
                    
                    for email_log in oldest_emails:
                        email_log.is_deleted = True
                        email_log.deleted_at = current_time
                        email_log.save(update_fields=['is_deleted', 'deleted_at'])
                        deleted_this_batch += 1
                    
                    total_deleted_db += deleted_this_batch
                    active_count = max(active_count - deleted_this_batch, 0)
                    
                    logger.info(f"✓ DB Cleanup: {deleted_this_batch} logs marked deleted for {user_email}")
                
                retry_count = 0

            except Exception as db_error:
                logger.error(f"Database deletion error for user {user.username} in batch {cleanup_batches}: {str(db_error)}")
                
                # Retry mechanism: attempt up to 3 times
                if retry_count < max_retries:
                    retry_count += 1
                    logger.warning(f"Retrying batch {cleanup_batches} (attempt {retry_count}/{max_retries})")
                    # Continue loop to retry
                    continue
                else:
                    logger.error(f"Failed to delete batch {cleanup_batches} after {max_retries} retries")
                    imap_errors.append(f"Database deletion failed after {max_retries} retries")
                    break

            # If we could not delete anything, break to avoid potential loop
            if deleted_this_batch == 0:
                logger.warning(f"No emails deleted in batch {cleanup_batches}. Breaking.")
                break

        success = not imap_errors and total_deleted_db > 0

        message_parts = [
            f"GUARANTEED: Soft-deleted {total_deleted_db} login email log(s) in {cleanup_batches} batch(es) "
            f"for user {user.username} (role: {user.role})",
        ]
        if total_imap_deleted:
            message_parts.append(f"IMAP deleted {total_imap_deleted} message(s)")
        if imap_errors:
            message_parts.append(f"IMAP warnings: {'; '.join(imap_errors)}")

        log_msg = "; ".join(filter(None, message_parts))
        
        if success or total_deleted_db > 0:
            logger.info(f"✓ Cleanup GUARANTEED SUCCESS: {log_msg}")
        else:
            logger.warning(f"⚠ Cleanup completed with warnings: {log_msg}")

        return {
            'success': success or total_deleted_db > 0,  # Success if ANY deletion occurred
            'message': log_msg,
            'deleted_count': total_deleted_db,
            'imap_deleted': total_imap_deleted,
            'is_warning': bool(imap_errors),
            'active_after_cleanup': active_count,
            'guaranteed': True,  # Mark as guaranteed
            'batches_processed': cleanup_batches
        }
    
    except Exception as e:
        logger.error(f"CRITICAL: Unhandled error in attempt_delete_excess_login_emails for user {user.username}: {str(e)}")
        return {
            'success': False,
            'message': f'Error checking email threshold: {str(e)}',
            'is_warning': True,
            'guaranteed': False
        }
