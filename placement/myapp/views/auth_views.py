import random
from datetime import timedelta
from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from myapp.models import OTP
from myapp.email_utils import send_login_email
from django.utils import timezone

User = get_user_model()


# 🔐 Generate JWT Tokens
def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


# 🌐 Get client IP
def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    return x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')


# 🌍 Browser info
def get_browser_info(request):
    user_agent = request.META.get('HTTP_USER_AGENT', 'Unknown')
    return user_agent[:100]


# 🔐 LOGIN
@api_view(['POST'])
@permission_classes([AllowAny])   # 🔥 IMPORTANT FIX
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    print(f"DEBUG LOGIN: username={username}, password={password}")

    user = User.objects.filter(username=username).first()

    if user:
        print(f"DEBUG: User found: {user.username}, role: {user.role}")

        if user.role == 'student':
            cutoff = timezone.now() - timedelta(days=30)
            last_activity = user.last_login or user.date_joined

            if not user.is_active:
                print("DEBUG: Student account inactive")
                return Response({"detail": "Account is inactive. Contact faculty to reactivate."}, status=403)

            if last_activity and last_activity < cutoff:
                user.is_active = False
                user.save(update_fields=['is_active'])
                print("DEBUG: Student locked due to inactivity")
                return Response({"detail": "Account locked after one month of inactivity. Contact faculty."}, status=403)

        password_valid = user.check_password(password)
        print(f"DEBUG: Password valid: {password_valid}")
        if password_valid:
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
            try:
                tokens = get_tokens(user)
                print(f"DEBUG: Tokens generated: access={bool(tokens.get('access'))}, refresh={bool(tokens.get('refresh'))}")
            except Exception as e:
                print(f"DEBUG: Token generation error: {e}")
                return Response({"detail": "Token generation failed"}, status=500)
            user_email = user.email or ""
            login_time = timezone.now().strftime("%Y-%m-%d %H:%M:%S")
            user_ip = get_client_ip(request)
            browser_info = get_browser_info(request)

            email_sent = False
            if user_email:
                try:
                    # Send login confirmation email to ALL users (students and faculty)
                    email_sent = send_login_email(
                        user_email=user_email,
                        username=username,
                        login_time=login_time,
                        user_ip=user_ip,
                        browser_info=browser_info,
                        user=user
                    )
                    print(f"DEBUG: Login email {'sent' if email_sent else 'failed to send'} for user {username} (role: {user.role})")
                except Exception as e:
                    print(f"Email error for user {username} (role: {user.role}): {e}")
            else:
                print(f"DEBUG: No email address for user {username} (role: {user.role}), skipping login confirmation email")

            response_data = {
                **tokens,
                "user": {
                    "username": user.username,
                    "email": user_email,
                    "name": user.first_name or user.username,
                    "role": user.role or "student"
                },
                "email_sent": email_sent
            }
            print(f"DEBUG: Response data keys: {list(response_data.keys())}")
            return Response(response_data)
    else:
        print("DEBUG: User not found")

    return Response({"detail": "Invalid credentials"}, status=401)


# 🔢 SEND OTP
@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    identifier = request.data.get("username")

    otp = str(random.randint(1000, 9999))
    OTP.objects.create(username=identifier, otp=otp)

    print("OTP:", otp)
    return Response({"message": "OTP sent"})


# ✅ VERIFY OTP
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    identifier = request.data.get("username")
    otp = request.data.get("otp")

    record = OTP.objects.filter(username=identifier, otp=otp).last()

    if record:
        user = User.objects.filter(Q(username=identifier) | Q(email=identifier)).first()
        if not user:
            return Response({"error": "Invalid OTP"}, status=400)
        tokens = get_tokens(user)
        return Response({
            **tokens,
            "user": {
                "username": user.username,
                "email": user.email,
                "name": user.first_name or user.username,
                "role": user.role or "student",
            },
        })

    return Response({"error": "Invalid OTP"}, status=400)


# 🔁 RESET PASSWORD
@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    identifier = request.data.get("username")
    password = request.data.get("password")

    user = User.objects.filter(Q(username=identifier) | Q(email=identifier)).first()

    if user:
        user.set_password(password)
        user.save()
        return Response({"success": True})

    return Response({"error": "User not found"}, status=404)


@api_view(['POST', 'PUT'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    
    # 🔍 Extract fields
    current_password = request.data.get("current_password") or request.data.get("old_password")
    new_password = request.data.get("new_password")
    confirm_password = request.data.get("confirm_password")

    print(f"DEBUG CHANGE_PASSWORD: user={user.username}")

    if not current_password or not new_password or not confirm_password:
        return Response({"detail": "Missing required fields"}, status=400)

    # 🔐 Verify old password
    if not user.check_password(current_password):
        print(f"DEBUG: Incorrect current password for user {user.username}")
        return Response({"detail": "Current password is incorrect"}, status=400)

    # 🔗 Verify match
    if new_password != confirm_password:
        return Response({"detail": "New passwords don't match"}, status=400)

    # 📏 Length check (8 chars min as per frontend)
    if len(new_password) < 8:
        return Response({"detail": "Password must be at least 8 characters long"}, status=400)

    # 💾 Update & Save
    user.set_password(new_password)
    user.save()
    
    print(f"DEBUG: Password changed for user {user.username}")
    return Response({"success": True, "message": "Password changed successfully!"})


# 📝 REGISTER
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get("username")
    password = request.data.get("password")
    email = request.data.get("email", "")
    role = request.data.get("role", "student")

    print(f"DEBUG REGISTER: username={username}, password={password}, email={email}, role={role}")

    if not username or not password:
        print("DEBUG: Missing username or password")
        return Response({"error": "Username and password required"}, status=400)

    if User.objects.filter(username=username).exists():
        print("DEBUG: Username already exists")
        return Response({"error": "Username already exists"}, status=400)

    user = User.objects.create_user(
        username=username,
        password=password,
        email=email
    )
    user.role = role
    user.save()

    tokens = get_tokens(user)

    return Response({
        **tokens,
        "user": {
            "username": user.username,
            "email": user.email,
            "role": user.role,
        },
        "message": "Registration successful"
    })