# views.py
import random
from django.contrib.auth.models import User
from django.core.mail import send_mail
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from myapp.models import OTP
from myapp.email_utils import (
    send_login_email, 
    test_smtp_connection, 
    send_test_email
)
from django.utils import timezone
from datetime import datetime


def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def get_browser_info(request):
    """Get browser information from request"""
    user_agent = request.META.get('HTTP_USER_AGENT', 'Unknown')
    return user_agent[:100] if len(user_agent) > 100 else user_agent


#  LOGIN
@api_view(['POST'])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = User.objects.filter(username=username).first()

    if user and user.check_password(password):
        tokens = get_tokens(user)
        
        # Get user details
        user_email = user.email or ""
        login_time = timezone.now().strftime("%Y-%m-%d %H:%M:%S")
        user_ip = get_client_ip(request)
        browser_info = get_browser_info(request)
        
        # Send login confirmation email if email exists
        if user_email:
            try:
                email_sent = send_login_email(
                    user_email=user_email,
                    username=username,
                    login_time=login_time,
                    user_ip=user_ip,
                    browser_info=browser_info
                )
            except Exception as e:
                print(f"Email sending error: {str(e)}")
                email_sent = False
        else:
            email_sent = False
        
        return Response({
            **tokens,
            "user": {
                "username": user.username,
                "email": user_email,
                "name": user.first_name or user.username,
                "role": "student"
            },
            "email_sent": email_sent
        })

    return Response({"detail": "Invalid credentials"}, status=400)


#  SEND OTP
@api_view(['POST'])
def send_otp(request):
    username = request.data.get("username")
    email = request.data.get("email")

    otp = str(random.randint(1000, 9999))

    OTP.objects.create(username=username, otp=otp)

    print("OTP:", otp)  # for testing

    return Response({"message": "OTP sent"})


#  VERIFY OTP
@api_view(['POST'])
def verify_otp(request):
    username = request.data.get("username")
    otp = request.data.get("otp")

    record = OTP.objects.filter(username=username, otp=otp).last()

    if record:
        user = User.objects.filter(username=username).first()
        tokens = get_tokens(user)
        return Response(tokens)

    return Response({"error": "Invalid OTP"}, status=400)


#  RESET PASSWORD
@api_view(['POST'])
def reset_password(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = User.objects.filter(username=username).first()

    if user:
        user.set_password(password)
        user.save()
        return Response({"success": True})

    return Response({"error": "User not found"}, status=404)


# 🧪 TEST SMTP CONNECTION
@api_view(['GET'])
def test_smtp(request):
    """
    Test SMTP connection and configuration
    GET /api/test-smtp/ - Returns SMTP status
    """
    result = test_smtp_connection()
    return Response(result)


# 📧 SEND TEST EMAIL
@api_view(['POST'])
def send_test_email_view(request):
    """
    Send a test email to verify SMTP is working
    POST /api/send-test-email/ with email in body
    """
    recipient_email = request.data.get("email")
    
    if not recipient_email:
        return Response({
            "status": "error",
            "message": "Email address is required"
        }, status=400)
    
    result = send_test_email(recipient_email)
    return Response(result)