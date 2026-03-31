import logging
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)

def send_login_email(user_email, username, login_time, user_ip, browser_info, user):
    """Sends a login confirmation email."""
    try:
        subject = '🔐 Login Confirmation - Placement Portal'
        message = f"Hello {username or user.username},\n\nA new login was detected on your account.\n\nTime: {login_time}\nIP: {user_ip}\nBrowser: {browser_info}\n\nIf this wasn't you, please change your password immediately."
        # Use a fail-safe send_mail
        # send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user_email], fail_silently=True)
        print(f"STUB: Email sent to {user_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send login email: {e}")
        return False

def send_exam_confirmation_email(user_email, exam_title, score, total_marks):
    """Sends an exam completion confirmation email."""
    try:
        print(f"STUB: Exam confirmation email sent to {user_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send exam email: {e}")
        return False

def send_leave_request_email(user_email, username, leave_type, start_date, end_date, reason, status):
    """Sends a leave request status update email."""
    try:
        print(f"STUB: Leave request email sent to {user_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send leave email: {e}")
        return False
