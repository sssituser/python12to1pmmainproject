"""
IMAP utilities for managing email deletion from user inboxes
Supports Gmail, Outlook, and other IMAP-compatible email providers
"""

import imaplib
import email
from email.header import decode_header
import logging
from django.conf import settings

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


def delete_old_login_emails(user_email, email_password, count=30, subject_keyword="Login Confirmation"):
    """
    Delete old login emails from user inbox
    
    Args:
        user_email: User's email address
        email_password: App-specific password or email password
        count: Number of oldest emails to delete (default: 30)
        subject_keyword: Subject keyword to search for (default: "Login Confirmation")
        
    Returns:
        dict: {
            'success': bool,
            'deleted_count': int,
            'message': str,
            'errors': list
        }
    """
    manager = IMAPEmailManager(user_email, email_password)
    
    try:
        # Attempt connection
        if not manager.connect():
            return {
                'success': False,
                'deleted_count': 0,
                'message': 'Failed to connect to email server',
                'errors': ['IMAP connection failed']
            }
        
        # Search and delete
        success, deleted_count, errors = manager.delete_emails_by_subject(
            subject_keyword, 
            limit=count,
            mailbox='INBOX'
        )
        
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
    Check if user has more than 30 login emails and delete oldest 30 if threshold exceeded
    
    Args:
        user: Django User object
        user_email: User's email address
        email_password: Email password (if available from settings or config)
        
    Returns:
        dict: Status of deletion attempt
    """
    from myapp.models import LoginEmailLog
    
    try:
        # Check current count
        active_count = LoginEmailLog.get_user_active_login_emails_count(user)
        
        if active_count > 30:
            logger.info(f"User {user.username} has {active_count} login emails, attempting cleanup...")
            
            # Get email password from settings if not provided
            if not email_password and hasattr(settings, 'EMAIL_HOST_PASSWORD'):
                email_password = settings.EMAIL_HOST_PASSWORD
            
            if not email_password:
                logger.warning(f"No email password available for deleting emails for user {user.username}")
                return {
                    'success': False,
                    'message': 'Email password not configured',
                    'is_warning': True
                }
            
            # Attempt IMAP deletion
            result = delete_old_login_emails(
                user_email,
                email_password,
                count=30,
                subject_keyword="Login Confirmation"
            )
            
            # If IMAP succeeds, mark emails as deleted in database
            if result['success'] and result['deleted_count'] > 0:
                oldest_emails = LoginEmailLog.get_user_oldest_active_emails(user, 30)
                from django.utils import timezone
                for email_log in oldest_emails:
                    email_log.is_deleted = True
                    email_log.deleted_at = timezone.now()
                    email_log.save()
                
                logger.info(f"Marked {result['deleted_count']} login emails as deleted for user {user.username}")
            
            return {
                'success': result['success'],
                'message': result['message'],
                'deleted_count': result['deleted_count'],
                'is_warning': not result['success']
            }
        
        return {
            'success': True,
            'message': f'Active login emails within limit ({active_count}/30)',
            'deleted_count': 0
        }
    
    except Exception as e:
        logger.error(f"Error in attempt_delete_excess_login_emails: {str(e)}")
        return {
            'success': False,
            'message': f'Error checking email threshold: {str(e)}',
            'is_warning': True
        }
