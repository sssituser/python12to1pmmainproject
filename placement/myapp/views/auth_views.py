import random
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
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
        password_valid = user.check_password(password)
        print(f"DEBUG: Password valid: {password_valid}")
        if password_valid:
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
                    email_sent = send_login_email(
                        user_email=user_email,
                        username=username,
                        login_time=login_time,
                        user_ip=user_ip,
                        browser_info=browser_info,
                        user=user
                    )
                except Exception as e:
                    print("Email error:", e)

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
    username = request.data.get("username")

    otp = str(random.randint(1000, 9999))
    OTP.objects.create(username=username, otp=otp)

    print("OTP:", otp)
    return Response({"message": "OTP sent"})


# ✅ VERIFY OTP
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    username = request.data.get("username")
    otp = request.data.get("otp")

    record = OTP.objects.filter(username=username, otp=otp).last()

    if record:
        user = User.objects.filter(username=username).first()
        tokens = get_tokens(user)
        return Response(tokens)

    return Response({"error": "Invalid OTP"}, status=400)


# 🔁 RESET PASSWORD
@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = User.objects.filter(username=username).first()

    if user:
        user.set_password(password)
        user.save()
        return Response({"success": True})

    return Response({"error": "User not found"}, status=404)


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