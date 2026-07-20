import logging
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.utils.html import strip_tags
from myapp.models import EmailConfiguration

logger = logging.getLogger(__name__)

# Global Platform Address
PLATFORM_URL = getattr(settings, 'PLATFORM_URL', 'http://40.192.98.128:5173').rstrip('/')

# Base path for local logo representation or hosted representation
LOGO_URL = "https://raw.githubusercontent.com/srinivas-sssit/images/main/sssit-logo-banner.png" # Standard URL fallback representation or local public folder path

# ── SHARED STYLES ─────────────────────────────────────────────
BASE_STYLE = """
    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    color: #334155;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
"""

HEADER_STYLE = "background-color: #f8fafc; border-bottom: 2px solid #1a3a9c; padding: 24px; text-align: center;"
CONTENT_STYLE = "padding: 32px; line-height: 1.6; font-size: 15px;"
FOOTER_STYLE = "background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;"
BUTTON_STYLE = "display: inline-block; padding: 12px 24px; background-color: #1a3a9c; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 16px;"

def _build_html(content, title="Notification"):
    return f"""
    <html>
    <body style="margin: 0; padding: 20px; background-color: #f8fafc; -webkit-font-smoothing: antialiased;">
        <div style="{BASE_STYLE}">
            <div style="{HEADER_STYLE}">
                <img src="cid:sssit_logo" alt="SSSIT Computer Education" style="max-height: 55px; margin-bottom: 12px; display: inline-block;" />
                <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; font-weight: 700;">{title}</div>
            </div>
            <div style="{CONTENT_STYLE}">
                {content}
            </div>
            <div style="{FOOTER_STYLE}">
                <strong style="color: #1a3a9c;">SSSIT Learning Management Portal</strong>
                <br>Since 1999 | ISO 9001:2015 Certified Computer Education
                <br><br>
                © {timezone_year()} SSSIT Computer Education. All rights reserved.
                <br>Please do not reply directly to this automated email.
            </div>
        </div>
    </body>
    </html>
    """

def timezone_year():
    from django.utils import timezone
    return timezone.now().year

def _send_rich_email(subject, to_email, html_content):
    """Sends a rich HTML email utilizing active SMTP configuration."""
    import os
    from email.mime.image import MIMEImage
    from pathlib import Path
    
    try:
        active_config = EmailConfiguration.objects.filter(is_active=True).first()
        from_email = settings.DEFAULT_FROM_EMAIL
        
        if active_config:
            from_email = active_config.default_from_email or active_config.email_host_user
            from django.core.mail import get_connection
            connection = get_connection(
                host=active_config.email_host,
                port=active_config.email_port,
                username=active_config.email_host_user,
                password=active_config.email_host_password,
                use_tls=active_config.email_use_tls,
                use_ssl=active_config.email_use_ssl,
                fail_silently=False,
            )
        else:
            connection = None

        text_content = strip_tags(html_content)
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=[to_email],
            connection=connection,
        )
        msg.attach_alternative(html_content, "text/html")

        # Attach SSSIT Logo inline via Content-ID (cid:sssit_logo)
        try:
            # Locate logo file: Parent of backend BASE_DIR is root project path
            logo_path = Path(settings.BASE_DIR).parent / "placementapp" / "public" / "sssit-logo.png"
            if logo_path.exists():
                with open(logo_path, 'rb') as f:
                    logo_data = f.read()
                mime_img = MIMEImage(logo_data)
                mime_img.add_header('Content-ID', '<sssit_logo>')
                mime_img.add_header('Content-Disposition', 'inline', filename='sssit-logo.png')
                msg.attach(mime_img)
        except Exception as logo_err:
            logger.error(f"Failed to attach inline logo to email: {logo_err}")

        msg.send(fail_silently=False)
        logger.info(f"HTML Email sent successfully to {to_email} | subject: {subject}")
        return True
    except Exception as e:
        logger.error(f"SMTP ERROR sending HTML to {to_email}: {type(e).__name__}: {e}")
        return False

def send_plain_email(subject, message, to_email):
    """Sends a fallback plain text email utilizing active SMTP configuration."""
    try:
        active_config = EmailConfiguration.objects.filter(is_active=True).first()
        from_email = settings.DEFAULT_FROM_EMAIL
        
        if active_config:
            from_email = active_config.default_from_email or active_config.email_host_user
            from django.core.mail import get_connection
            connection = get_connection(
                host=active_config.email_host,
                port=active_config.email_port,
                username=active_config.email_host_user,
                password=active_config.email_host_password,
                use_tls=active_config.email_use_tls,
                use_ssl=active_config.email_use_ssl,
                fail_silently=False,
            )
        else:
            connection = None

        msg = EmailMultiAlternatives(
            subject=subject,
            body=message,
            from_email=from_email,
            to=[to_email],
            connection=connection,
        )
        msg.send(fail_silently=False)
        logger.info(f"Plain Email sent successfully to {to_email} | subject: {subject}")
        return True
    except Exception as e:
        logger.error(f"SMTP ERROR sending plain to {to_email}: {type(e).__name__}: {e}")
        return False

# ── EMAIL FUNCTIONS ───────────────────────────────────────────

def send_account_creation_email(user_email, username, password, role):
    """Sends account details to newly created users."""
    subject = f"Welcome to SSSIT - Your {role.capitalize()} Account is Ready!"
    
    content = f"""
        <h3 style="color: #1a3a9c; margin-top: 0; font-size: 18px;">Welcome, {username}!</h3>
        <p>Your account has been successfully created by the administrator. You can now log in to the SSSIT Learning Management Portal using the credentials below:</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px; color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em;">Login Credentials</p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Username:</strong> <span style="color: #0f172a;">{username}</span></p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Password:</strong> <code style="background: #e2e8f0; padding: 3px 6px; border-radius: 4px; color: #b45309; font-weight: bold;">{password}</code></p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Role:</strong> <span style="color: #0f172a;">{role.capitalize()}</span></p>
        </div>
        
        <p style="font-size: 13px; color: #64748b;">For security reasons, we strongly recommend that you change your password immediately after your first login.</p>
        <div style="text-align: center; margin-top: 24px;">
            <a href="{PLATFORM_URL}/" style="{BUTTON_STYLE}">Login to LMS Portal</a>
        </div>
    """
    
    return _send_rich_email(subject, user_email, _build_html(content, "Account Registration"))

def send_login_email(user_email, username, login_time, user_ip, browser_info, user=None):
    """Sends a beautiful login confirmation email."""
    subject = '🔐 Security Alert: New Login Detected'
    
    content = f"""
        <h3 style="color: #dc2626; margin-top: 0; font-size: 18px;">New Login Notification</h3>
        <p>Hi <strong>{username or user.username}</strong>, we detected a new login to your SSSIT account.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0; font-size: 14px;">
            <p style="margin: 6px 0;"><strong style="color: #64748b;">Time:</strong> {login_time}</p>
            <p style="margin: 6px 0;"><strong style="color: #64748b;">IP Address:</strong> {user_ip}</p>
            <p style="margin: 6px 0;"><strong style="color: #64748b;">Device/Browser:</strong> {browser_info}</p>
        </div>
        
        <p style="color: #64748b; font-size: 13px;">If this login was authorized by you, no further action is required. If you do not recognize this activity, please reset your password immediately to protect your account.</p>
        <div style="text-align: center; margin-top: 24px;">
            <a href="{PLATFORM_URL}/" style="{BUTTON_STYLE}">Go to Dashboard</a>
        </div>
    """
    
    return _send_rich_email(subject, user_email, _build_html(content, "LMS Security Alert"))

def send_exam_confirmation_email(user_email, exam_title, score, total_marks):
    """Sends an exam completion confirmation email with results."""
    subject = f"Exam Results: {exam_title}"
    percent = round((score / total_marks) * 100, 1) if total_marks else 0
    status_color = "#16a34a" if percent >= 50 else "#dc2626"
    
    content = f"""
        <h3 style="color: #1a3a9c; margin-top: 0; font-size: 18px;">Assessment Completed Successfully</h3>
        <p>Thank you for participating. You have completed the assessment for <strong>{exam_title}</strong>.</p>
        
        <div style="text-align: center; margin: 28px 0; background-color: #f8fafc; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div style="font-size: 40px; font-weight: 800; color: {status_color};">{percent}%</div>
            <p style="margin: 4px 0; color: #64748b; font-size: 14px;">Overall Score Rating</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 12px 0; color: #64748b;">Points Obtained</td>
                <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #0f172a;">{score} / {total_marks}</td>
            </tr>
            <tr>
                <td style="padding: 12px 0; color: #64748b;">Evaluation Status</td>
                <td style="padding: 12px 0; text-align: right; font-weight: 700; color: {status_color};">
                    {'PASSED' if percent >= 50 else 'RE-ATTEMPT REQUIRED'}
                </td>
            </tr>
        </table>
        
        <div style="text-align: center; margin-top: 24px;">
            <a href="{PLATFORM_URL}/" style="{BUTTON_STYLE}">View Performance Analytics</a>
        </div>
    """
    
    return _send_rich_email(subject, user_email, _build_html(content, "Assessment Report Card"))

def send_leave_request_email(user_email, username, leave_type, start_date, end_date, reason, status):
    """Sends a leave request status update email."""
    status_map = {
        "pending": {"color": "#d97706", "icon": "⏳"},
        "approved": {"color": "#16a34a", "icon": "✅"},
        "rejected": {"color": "#dc2626", "icon": "❌"}
    }
    s = status_map.get(status.lower(), {"color": "#64748b", "icon": "ℹ️"})
    
    subject = f"Leave Request {status.capitalize()} - {username}"
    
    content = f"""
        <h3 style="color: {s['color']}; margin-top: 0; font-size: 18px;">{s['icon']} Leave Request Updated</h3>
        <p>Dear {username}, the status of your leave request has been marked as <strong>{status.upper()}</strong>.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid {s['color']}; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
            <p style="margin: 4px 0; font-size: 14px;"><strong style="color: #64748b;">Leave Type:</strong> {leave_type}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong style="color: #64748b;">Requested Dates:</strong> {start_date} to {end_date}</p>
            <p style="margin: 12px 0 4px; font-size: 14px;"><strong style="color: #64748b;">Reason provided:</strong></p>
            <p style="margin: 0; font-style: italic; color: #475569; background-color: #ffffff; padding: 10px; border-radius: 4px; border: 1px solid #e2e8f0;">"{reason}"</p>
        </div>
        
        <div style="text-align: center; margin-top: 24px;">
            <a href="{PLATFORM_URL}/" style="{BUTTON_STYLE}">View Leaves Overview</a>
        </div>
    """
    
    return _send_rich_email(subject, user_email, _build_html(content, "Leave Application Update"))

def send_job_notification_email(user_email, username, job):
    """Sends a job opportunity notification email to a student when a new job is posted."""
    subject = f"🚀 New Career Opening: {job.job_title} at {job.company}"

    details_rows = ""
    if job.location:
        details_rows += f'<tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:10px 0;color:#64748b;">📍 Location</td><td style="padding:10px 0;text-align:right;font-weight:600;color:#0f172a;">{job.location}</td></tr>'
    if job.job_type:
        details_rows += f'<tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:10px 0;color:#64748b;">💼 Job Type</td><td style="padding:10px 0;text-align:right;font-weight:600;color:#0f172a;">{job.job_type}</td></tr>'
    if job.salary:
        details_rows += f'<tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:10px 0;color:#64748b;">💰 Salary Package</td><td style="padding:10px 0;text-align:right;font-weight:600;color:#0f172a;">{job.salary}</td></tr>'
    if job.experience:
        details_rows += f'<tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:10px 0;color:#64748b;">🎯 Experience Required</td><td style="padding:10px 0;text-align:right;font-weight:600;color:#0f172a;">{job.experience}</td></tr>'
    if job.eligibility:
        details_rows += f'<tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:10px 0;color:#64748b;">✅ Eligibility Criteria</td><td style="padding:10px 0;text-align:right;font-weight:600;color:#0f172a;">{job.eligibility}</td></tr>'
    if job.deadline:
        details_rows += f'<tr><td style="padding:10px 0;color:#64748b;">⏰ Application Deadline</td><td style="padding:10px 0;text-align:right;font-weight:600;color:#b45309;">{job.deadline}</td></tr>'

    skills_section = ""
    if job.primary_skills:
        skills_html = "".join(
            f'<span style="display:inline-block;background:#e0e7ff;color:#4338ca;padding:4px 10px;border-radius:20px;font-size:12px;margin:3px;font-weight:500;">{s.strip()}</span>'
            for s in job.primary_skills.split(",") if s.strip()
        )
        skills_section = f"""
        <div style="margin:20px 0;">
            <p style="color:#64748b;font-size:12px;text-transform:uppercase;margin:0 0 8px;font-weight:bold;">Primary Skills Needed</p>
            <div>{skills_html}</div>
        </div>
        """

    content = f"""
        <h3 style="color: #1a3a9c; margin-top: 0; font-size: 18px;">Hi {username}, a new job opportunity has been posted!</h3>
        <p>A new career opening matching our recruitment ecosystem is ready for applications:</p>

        <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0; border-left: 4px solid #1a3a9c;">
            <h4 style="margin: 0 0 4px; font-size: 17px; color: #0f172a;">{job.job_title}</h4>
            <p style="margin: 0; color: #1a3a9c; font-size: 14px; font-weight: 600;">{job.company}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            {details_rows}
        </table>

        {skills_section}

        <div style="text-align: center; margin-top: 24px;">
            <a href="{PLATFORM_URL}/dashboard/alljobs" style="{BUTTON_STYLE}">View &amp; Apply in Portal</a>
        </div>
    """

    return _send_rich_email(subject, user_email, _build_html(content, "Placement Opportunity"))

def send_course_update_email(user_email, username, course_title, update_type, update_details):
    """Sends a course update notification email to a student when new material is posted."""
    update_icon = '📚' if update_type == 'topic' else '🎓'
    update_type_display = 'Topic' if update_type == 'topic' else 'Subject'
    
    subject = f"📖 New {update_type_display} Added: {course_title}"
    
    content = f"""
        <h3 style="color:#1a3a9c;margin-top:0;font-size:18px;">{update_icon} Course Material Update</h3>
        <p>Hello <strong>{username}</strong>, new curriculum resources are available in the course you are attending:</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0; border-left: 4px solid #1a3a9c;">
            <h4 style="margin:0 0 6px;font-size:16px;color:#0f172a;">📖 {course_title}</h4>
            <p style="margin:0;color:#64748b;font-size:14px;">{update_type_display}: <strong style="color:#1a3a9c;">{update_details.get('name', 'N/A')}</strong></p>
        </div>
        
        {f'<div style="background-color:#f1f5f9;padding:12px;border-radius:6px;font-size:13px;color:#475569;margin-bottom:20px;"><strong>Description:</strong> {update_details.get("description", "")}</div>' if update_details.get('description') else ''}
        
        <div style="text-align: center; margin-top: 24px;">
            <a href="{PLATFORM_URL}/" style="{BUTTON_STYLE}">Open Learning Portal</a>
        </div>
    """
    
    return _send_rich_email(subject, user_email, _build_html(content, "Curriculum Notification"))
