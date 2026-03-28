"""
Email utility functions for sending transactional emails
"""

from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def send_login_email(user_email, username, login_time, user_ip, browser_info):
    """
    Send login confirmation email to user
    """
    subject = "🔐 Login Confirmation - SSSIT Placement Portal"
    
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #333; text-align: center;">Welcome Back! 👋</h2>
                
                <p style="color: #666; font-size: 16px;">
                    Hi <strong>{username}</strong>,
                </p>
                
                <p style="color: #666; font-size: 16px;">
                    You have successfully logged in to the SSSIT Placement Portal.
                </p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
                    <p style="margin: 5px 0; color: #555;"><strong>Login Time:</strong> {login_time}</p>
                    <p style="margin: 5px 0; color: #555;"><strong>IP Address:</strong> {user_ip}</p>
                    <p style="margin: 5px 0; color: #555;"><strong>Browser:</strong> {browser_info}</p>
                </div>
                
                <p style="color: #999; font-size: 14px; margin-top: 30px;">
                    If this wasn't you, please contact our support team immediately.
                </p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                
                <p style="color: #999; font-size: 12px; text-align: center;">
                    © 2024 SSSIT Placement Portal. All rights reserved.
                </p>
            </div>
        </body>
    </html>
    """
    
    text_content = f"""
    Welcome to SSSIT Placement Portal!
    
    Hi {username},
    
    You have successfully logged in.
    
    Login Details:
    Time: {login_time}
    IP: {user_ip}
    Browser: {browser_info}
    
    If this wasn't you, contact our support team.
    
    © 2024 SSSIT Placement Portal
    """
    
    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user_email]
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        logger.info(f"Login email sent to {user_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send login email to {user_email}: {str(e)}")
        return False


def send_exam_confirmation_email(user_email, username, exam_name, exam_date, exam_time, duration, total_questions):
    """
    Send exam confirmation email to user
    """
    subject = f"📝 Exam Confirmation - {exam_name}"
    
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #333; text-align: center;">Exam Confirmation 📝</h2>
                
                <p style="color: #666; font-size: 16px;">
                    Hi <strong>{username}</strong>,
                </p>
                
                <p style="color: #666; font-size: 16px;">
                    Your exam has been successfully submitted!
                </p>
                
                <div style="background-color: #f0f7ff; padding: 20px; border-left: 4px solid #2196F3; margin: 20px 0; border-radius: 5px;">
                    <h3 style="color: #2196F3; margin-top: 0;">Exam Details:</h3>
                    <p style="margin: 8px 0; color: #555;"><strong>Exam:</strong> {exam_name}</p>
                    <p style="margin: 8px 0; color: #555;"><strong>Date:</strong> {exam_date}</p>
                    <p style="margin: 8px 0; color: #555;"><strong>Time:</strong> {exam_time}</p>
                    <p style="margin: 8px 0; color: #555;"><strong>Duration:</strong> {duration} minutes</p>
                    <p style="margin: 8px 0; color: #555;"><strong>Questions:</strong> {total_questions}</p>
                </div>
                
                <div style="background-color: #fffbea; padding: 15px; border-left: 4px solid #FF9800; margin: 20px 0; border-radius: 5px;">
                    <p style="margin: 0; color: #FF6F00;"><strong>⚠️ Important:</strong> Make sure you have a stable internet connection and a quiet environment for the exam.</p>
                </div>
                
                <p style="color: #666; font-size: 14px; margin-top: 20px;">
                    Check your dashboard for results and detailed analysis.
                </p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                
                <p style="color: #999; font-size: 12px; text-align: center;">
                    © 2024 SSSIT Placement Portal. All rights reserved.
                </p>
            </div>
        </body>
    </html>
    """
    
    text_content = f"""
    Exam Confirmation
    
    Hi {username},
    
    Your exam has been successfully submitted!
    
    Exam Details:
    Name: {exam_name}
    Date: {exam_date}
    Time: {exam_time}
    Duration: {duration} minutes
    Questions: {total_questions}
    
    Check your dashboard for results and detailed analysis.
    
    © 2024 SSSIT Placement Portal
    """
    
    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user_email]
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        logger.info(f"Exam confirmation email sent to {user_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send exam email to {user_email}: {str(e)}")
        return False


def send_leave_request_email(user_email, username, leave_type, start_date, end_date, reason, status):
    """
    Send leave request status email to user
    """
    status_lower = status.lower()
    status_color = "#4CAF50" if status_lower == "approved" else "#FF9800" if status_lower == "pending" else "#F44336"
    status_emoji = "✅" if status_lower == "approved" else "⏳" if status_lower == "pending" else "❌"
    
    # Customize message content based on status
    if status_lower == "approved":
        subject = f"✅ Leave Request Approved - {leave_type}"
        main_message = f"Your leave request for {start_date} to {end_date} (Reason: {reason}) has been approved."
        sub_message = "You are officially marked on leave for the mentioned period."
        footer_sign = "Regards,"
    elif status_lower == "pending":
        subject = f"⏳ Leave Request Submitted - {leave_type}"
        main_message = f"Your leave request for {start_date} to {end_date} (Reason: {reason}) has been submitted successfully."
        sub_message = "Our faculty team will review your request and notify you once a decision is made."
        footer_sign = "Thank you,"
    else:  # rejected
        subject = f"❌ Leave Request Rejected - {leave_type}"
        main_message = f"We regret to inform you that your leave request for {start_date} to {end_date} (Reason: {reason}) has been rejected."
        sub_message = "For further clarification, please contact your faculty coordinator."
        footer_sign = "Thank you,"

    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: {status_color}; text-align: center;">{subject}</h2>
                
                <p style="color: #666; font-size: 16px;">
                    Dear <strong>{username}</strong>,
                </p>
                
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                    {main_message}
                </p>
                
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                    {sub_message}
                </p>
                
                <p style="color: #666; font-size: 16px; margin-top: 30px;">
                    {footer_sign}<br>
                    <strong>SSSIT Team</strong>
                </p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                
                <p style="color: #999; font-size: 12px; text-align: center;">
                    © 2024 SSSIT Placement Portal. All rights reserved.
                </p>
            </div>
        </body>
    </html>
    """
    
    text_content = f"""
    {subject}
    
    Dear {username},
    
    {main_message}
    
    {sub_message}
    
    {footer_sign}
    SSSIT Team
    
    © 2024 SSSIT Placement Portal
    """

    
    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user_email]
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        logger.info(f"Leave request email sent to {user_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send leave request email to {user_email}: {str(e)}")
        return False


def send_bulk_email(email_list, subject, html_content, text_content):
    """
    Send email to multiple recipients
    """
    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=email_list
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        logger.info(f"Bulk email sent to {len(email_list)} recipients")
        return True
    except Exception as e:
        logger.error(f"Failed to send bulk email: {str(e)}")
        return False


def test_smtp_connection():
    """
    Test SMTP connection and configuration
    Returns dict with status and details
    """
    try:
        from django.core.mail import get_connection
        
        connection = get_connection()
        connection.open()
        connection.close()
        
        return {
            'status': 'success',
            'message': 'SMTP connection successful',
            'details': {
                'email_backend': settings.EMAIL_BACKEND,
                'email_host': settings.EMAIL_HOST,
                'email_port': settings.EMAIL_PORT,
                'email_use_tls': settings.EMAIL_USE_TLS,
                'email_host_user': settings.EMAIL_HOST_USER,
                'default_from_email': settings.DEFAULT_FROM_EMAIL,
            }
        }
    except Exception as e:
        logger.error(f"SMTP connection failed: {str(e)}")
        return {
            'status': 'error',
            'message': f'SMTP connection failed: {str(e)}',
            'details': {
                'email_backend': settings.EMAIL_BACKEND,
                'email_host': settings.EMAIL_HOST,
                'email_port': settings.EMAIL_PORT,
                'email_use_tls': settings.EMAIL_USE_TLS,
                'email_host_user': settings.EMAIL_HOST_USER,
            }
        }


def send_test_email(recipient_email):
    """
    Send a test email to verify SMTP is working
    """
    subject = "🧪 SMTP Test Email - SSSIT Placement Portal"
    
    html_content = """
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #4CAF50; text-align: center;">✅ SMTP Test Successful!</h2>
                
                <p style="color: #666; font-size: 16px; text-align: center;">
                    Your email system is configured correctly and working.
                </p>
                
                <div style="background-color: #f0f7f0; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0; border-radius: 5px; text-align: center;">
                    <p style="margin: 0; color: #2e7d32; font-size: 18px;">
                        <strong>Email System Status: ACTIVE ✓</strong>
                    </p>
                </div>
                
                <p style="color: #666; font-size: 14px;">
                    This is a test email from the SSSIT Placement Portal. If you received this email, it means:
                </p>
                
                <ul style="color: #666; font-size: 14px; line-height: 1.8;">
                    <li>✓ SMTP server connection is working</li>
                    <li>✓ Email credentials are valid</li>
                    <li>✓ Email sending is enabled</li>
                    <li>✓ All users will receive notifications</li>
                </ul>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                
                <p style="color: #999; font-size: 12px; text-align: center;">
                    © 2024 SSSIT Placement Portal. All rights reserved.
                </p>
            </div>
        </body>
    </html>
    """
    
    text_content = """
    SMTP Test Email - SSSIT Placement Portal
    
    ✅ SMTP Test Successful!
    
    Your email system is configured correctly and working.
    
    Email System Status: ACTIVE ✓
    
    This is a test email from the SSSIT Placement Portal. If you received this email, it means:
    - SMTP server connection is working
    - Email credentials are valid
    - Email sending is enabled
    - All users will receive notifications
    
    © 2024 SSSIT Placement Portal
    """
    
    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient_email]
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        logger.info(f"Test email sent to {recipient_email}")
        return {
            'status': 'success',
            'message': f'Test email sent successfully to {recipient_email}'
        }
    except Exception as e:
        logger.error(f"Failed to send test email to {recipient_email}: {str(e)}")
        return {
            'status': 'error',
            'message': f'Failed to send test email: {str(e)}'
        }
