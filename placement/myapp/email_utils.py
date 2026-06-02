import logging
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)

# ── SHARED STYLES ─────────────────────────────────────────────
BASE_STYLE = """
    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    background-color: #0f172a;
    color: #f1f5f9;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
"""

HEADER_STYLE = "background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 32px; text-align: center;"
CONTENT_STYLE = "padding: 40px; line-height: 1.6;"
FOOTER_STYLE = "background-color: #1e293b; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;"
BUTTON_STYLE = "display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px;"

def _build_html(content, title="Notification"):
    return f"""
    <html>
    <body style="margin: 0; padding: 20px; background-color: #f8fafc;">
        <div style="{BASE_STYLE}">
            <div style="{HEADER_STYLE}">
                <h1 style="margin: 0; color: white; font-size: 24px; letter-spacing: -0.025em;">SSSIT Placement Portal 🚀</h1>
                <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">{title}</p>
            </div>
            <div style="{CONTENT_STYLE}">
                {content}
            </div>
            <div style="{FOOTER_STYLE}">
                © {getattr(settings, 'PLATFORM_NAME', 'SSSIT Placement Portal')} · Automated Message
                <br>Please do not reply to this email.
            </div>
        </div>
    </body>
    </html>
    """

def _send_rich_email(subject, to_email, html_content):
    text_content = strip_tags(html_content)
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'admin@sssit.info')
    
    msg = EmailMultiAlternatives(subject, text_content, from_email, [to_email])
    msg.attach_alternative(html_content, "text/html")
    try:
        msg.send(fail_silently=False)
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False


def send_plain_email(subject, message, to_email):
    """Send a plain text email through the configured SMTP backend."""
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', getattr(settings, 'EMAIL_HOST_USER', 'admin@sssit.info'))
    msg = EmailMultiAlternatives(subject, message, from_email, [to_email])
    try:
        msg.send(fail_silently=False)
        return True
    except Exception as e:
        logger.error(f"Failed to send plain email to {to_email}: {e}")
        return False

# ── EMAIL FUNCTIONS ───────────────────────────────────────────

def send_account_creation_email(user_email, username, password, role):
    """Sends account details to newly created users."""
    subject = f"Welcome to SSSIT - Your {role.capitalize()} Account is Ready!"
    
    content = f"""
        <h2 style="color: #818cf8; margin-top: 0;">Welcome, {username}!</h2>
        <p>Your account has been successfully created by the administrator. You can now log in to the Placement Portal using the credentials below:</p>
        
        <div style="background-color: #1e293b; padding: 20px; border-radius: 12px; margin: 24px 0;">
            <p style="margin: 0 0 10px; color: #94a3b8; font-size: 13px; text-transform: uppercase;">Login Credentials</p>
            <p style="margin: 5px 0;"><strong>Username:</strong> {username}</p>
            <p style="margin: 5px 0;"><strong>Password:</strong> <code style="background: #334155; padding: 2px 6px; border-radius: 4px; color: #fbbf24;">{password}</code></p>
            <p style="margin: 5px 0;"><strong>Role:</strong> {role.capitalize()}</p>
        </div>
        
        <p>For security reasons, we recommend that you change your password after your first login.</p>
        <a href="{getattr(settings, 'PLATFORM_URL', 'http://localhost:5174')}/" style="{BUTTON_STYLE}">Login to Portal</a>
    """
    
    return _send_rich_email(subject, user_email, _build_html(content, "Account Created"))

def send_login_email(user_email, username, login_time, user_ip, browser_info, user=None):
    """Sends a beautiful login confirmation email."""
    subject = '🔐 Security Alert: New Login Detected'
    
    content = f"""
        <h2 style="color: #4ade80; margin-top: 0;">Login Successful</h2>
        <p>Hi <strong>{username or user.username}</strong>, we detected a new login to your account.</p>
        
        <div style="background-color: #1e293b; padding: 20px; border-radius: 12px; margin: 24px 0; font-size: 14px;">
            <p style="margin: 5px 0;"><strong style="color: #94a3b8;">Time:</strong> {login_time}</p>
            <p style="margin: 5px 0;"><strong style="color: #94a3b8;">IP Address:</strong> {user_ip}</p>
            <p style="margin: 5px 0;"><strong style="color: #94a3b8;">Device/Browser:</strong> {browser_info}</p>
        </div>
        
        <p style="color: #94a3b8; font-size: 14px;">If this wasn't you, please secure your account by changing your password immediately.</p>
        <a href="{getattr(settings, 'PLATFORM_URL', 'http://localhost:5174')}/dashboard/profile" style="{BUTTON_STYLE}">Review Activity</a>
    """
    
    return _send_rich_email(subject, user_email, _build_html(content, "Security Alert"))

def send_exam_confirmation_email(user_email, exam_title, score, total_marks):
    """Sends an exam completion confirmation email with results."""
    subject = f"Exam Results: {exam_title}"
    percent = round((score / total_marks) * 100, 1) if total_marks else 0
    status_color = "#4ade80" if percent >= 50 else "#f87171"
    
    content = f"""
        <h2 style="color: #a5b4fc; margin-top: 0;">Assessment Completed</h2>
        <p>Well done! You have completed your assessment for <strong>{exam_title}</strong>.</p>
        
        <div style="text-align: center; margin: 32px 0;">
            <div style="font-size: 48px; font-weight: 800; color: {status_color};">{percent}%</div>
            <p style="margin: 4px 0; color: #94a3b8;">Overall Score</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr style="border-bottom: 1px solid #334155;">
                <td style="padding: 12px 0; color: #94a3b8;">Points Obtained</td>
                <td style="padding: 12px 0; text-align: right; font-weight: 600;">{score} / {total_marks}</td>
            </tr>
            <tr>
                <td style="padding: 12px 0; color: #94a3b8;">Status</td>
                <td style="padding: 12px 0; text-align: right; font-weight: 600; color: {status_color};">
                    {'PASSED' if percent >= 50 else 'NEEDS IMPROVEMENT'}
                </td>
            </tr>
        </table>
        
        <a href="{getattr(settings, 'PLATFORM_URL', 'http://localhost:5174')}/dashboard/exam-reports" style="{BUTTON_STYLE}">View Detailed Report</a>
    """
    
    return _send_rich_email(subject, user_email, _build_html(content, "Exam Result"))

def send_leave_request_email(user_email, username, leave_type, start_date, end_date, reason, status):
    """Sends a leave request status update email."""
    status_map = {
        "pending": {"color": "#fbbf24", "icon": "⏳"},
        "approved": {"color": "#4ade80", "icon": "✅"},
        "rejected": {"color": "#f87171", "icon": "❌"}
    }
    s = status_map.get(status.lower(), {"color": "#94a3b8", "icon": "ℹ️"})
    
    subject = f"Leave Request {status.capitalize()} - {username}"
    
    content = f"""
        <h2 style="color: {s['color']}; margin-top: 0;">{s['icon']} Leave Request {status.capitalize()}</h2>
        <p>Hi {username}, your leave request has been updated to <strong>{status.upper()}</strong>.</p>
        
        <div style="background-color: #1e293b; padding: 24px; border-radius: 12px; margin: 24px 0; border-left: 4px solid {s['color']};">
            <p style="margin: 5px 0;"><strong style="color: #94a3b8;">Type:</strong> {leave_type}</p>
            <p style="margin: 5px 0;"><strong style="color: #94a3b8;">Duration:</strong> {start_date} to {end_date}</p>
            <p style="margin: 15px 0 5px;"><strong style="color: #94a3b8;">Reason:</strong></p>
            <p style="margin: 0; font-style: italic; color: #cbd5e1;">"{reason}"</p>
        </div>
        
        <a href="{getattr(settings, 'PLATFORM_URL', 'http://localhost:5174')}/dashboard/leave-request/summary" style="{BUTTON_STYLE}">View in Portal</a>
    """
    
    return _send_rich_email(subject, user_email, _build_html(content, "Leave Management"))
