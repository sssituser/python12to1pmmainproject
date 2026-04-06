import random
from datetime import timedelta
from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from myapp.models import OTP, StudentProfile, Course
from myapp.email_utils import send_login_email
from django.conf import settings
from django.core.mail import send_mail
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
    studentId = request.data.get("studentId")
    password = request.data.get("password")

    print(f"DEBUG LOGIN: username={username}, studentId={studentId}, password={password}")

    user = None
    
    # Handle student ID login
    if studentId:
        try:
            # Look up user by student ID through StudentProfile
            student_profile = StudentProfile.objects.filter(student_id=studentId).first()
            if student_profile:
                user = student_profile.user
                print(f"DEBUG: Found user via student ID: {user.username}")
            else:
                # Fallback: try to find user with student_id as username
                user = User.objects.filter(username=studentId, role='student').first()
                if user:
                    print(f"DEBUG: Found user with student ID as username: {user.username}")
        except (ValueError, StudentProfile.DoesNotExist):
            pass
    
    # Handle regular username/email login
    elif username:
        user = User.objects.filter(Q(username=username) | Q(email=username)).first()

    if user:
        # 🔐 Verify password FIRST before checking active status
        password_valid = user.check_password(password)
        print(f"DEBUG: User found: {user.username}, Password valid: {password_valid}")

        if not password_valid:
            return Response({"detail": "Invalid credentials"}, status=401)

        # ⚡ AUTO-ACTIVATE FACULTY ON CORRECT LOGIN (Fix for stuck accounts)
        if user.role == 'faculty' and not user.is_active:
            print(f"DEBUG: Auto-activating faculty account for {user.username}")
            user.is_active = True
            # We will save after updating last_login below
        
        # 🛡️ ADMINS ARE ALWAYS ALLOWED (no activation needed)
        elif user.role == 'admin':
            print(f"DEBUG: Admin login detected for {user.username}")
            # Admins don't need activation checks
        
        # 🛑 Still block inactive students
        elif user.role == 'student' and not user.is_active:
            print(f"DEBUG: Student account inactive: {user.username}")
            return Response({"detail": "Account is inactive. Contact faculty to reactivate."}, status=403)

        if user.role == 'student':
            cutoff = timezone.now() - timedelta(days=30)
            last_activity = user.last_login or user.date_joined
            if last_activity and last_activity < cutoff:
                user.is_active = False
                user.save(update_fields=['is_active'])
                print(f"DEBUG: Student {user.username} locked due to inactivity")
                return Response({"detail": "Account locked after one month of inactivity. Contact faculty."}, status=403)

        # ✅ SUCCESSFUL LOGIN FLOW
        user.last_login = timezone.now()
        # If faculty was inactive, this save will also activate them
        user.save(update_fields=['last_login', 'is_active'])
        
        try:
            tokens = get_tokens(user)
            print(f"DEBUG: Tokens generated for {user.username}")
        except Exception as e:
            return Response({"detail": f"Token generation failed: {str(e)}"}, status=500)
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
                print(f"DEBUG: Login email {'sent' if email_sent else 'failed to send'} for user {username}")
            except Exception as e:
                print(f"Email error for user {username}: {e}")
        else:
            print(f"DEBUG: No email address for user {username}, skipping login confirmation email")

        response_data = {
            **tokens,
            "user": {
                "username": user.username,
                "email": user_email,
                "name": user.first_name or user.username,
                "role": user.role or "unknown",
                "course": StudentProfile.objects.filter(user=user).select_related('course').first().course.title if user.role == 'student' and StudentProfile.objects.filter(user=user).select_related('course').exists() and StudentProfile.objects.filter(user=user).select_related('course').first().course is not None else ""
            },
            "email_sent": email_sent
        }
        
        # Add studentId to response for students
        if user.role == 'student':
            try:
                student_profile = StudentProfile.objects.filter(user=user).first()
                if student_profile and student_profile.student_id:
                    response_data["user"]["studentId"] = student_profile.student_id
            except:
                pass
        
        print(f"DEBUG: Response data successful for {user.username}")
        return Response(response_data)
    else:
        print("DEBUG: User not found")

    return Response({"detail": "Invalid credentials"}, status=401)


# 🔢 SEND OTP
from django.core.mail import send_mail
from django.conf import settings

@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    identifier = request.data.get("username")
    if not identifier:
        return Response({"error": "Identifier (username or email) is required"}, status=400)

    # 🔍 Find user to get their email
    user = User.objects.filter(Q(username=identifier) | Q(email=identifier)).first()
    target_email = identifier if "@" in identifier else (user.email if user else None)

    if not target_email:
        return Response({"error": "Could not find a valid email for this user. Please use your email address."}, status=400)

    otp = str(random.randint(100000, 999999)) # 6 digits for mapping to OTP model if needed, or 4 as per Login.jsx expectation
    # But Login.jsx has maxLength={6} (line 371), so 6 digits is better.
    
    OTP.objects.create(username=identifier, email=target_email, otp=otp)

    try:
        subject = f"Your OTP for {settings.PLATFORM_NAME}"
        message = f"Hello {user.username if user else 'User'},\n\nYour One-Time Password (OTP) for login is: {otp}\n\nThis code will expire shortly. Do not share it with anyone."
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [target_email],
            fail_silently=False,
        )
        print(f"DEBUG: OTP {otp} sent successfully to {target_email}")
        return Response({"message": "OTP sent successfully"})
    except Exception as e:
        print(f"DEBUG: Failed to send OTP email: {str(e)}")
        return Response({"error": f"Failed to send email: {str(e)}"}, status=500)


# ✅ VERIFY OTP
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    identifier = request.data.get("username")
    otp = request.data.get("otp")

    record = OTP.objects.filter(Q(username=identifier) | Q(email=identifier), otp=otp).last()

    if record:
        user = User.objects.filter(Q(username=identifier) | Q(email=identifier)).first()
        if not user:
            return Response({"error": "Invalid OTP"}, status=400)
        # ✅ ACTIVATE USER ON SUCCESSFUL OTP
        if not user.is_active:
            user.is_active = True
            user.save(update_fields=['is_active'])

        tokens = get_tokens(user)
        student_profile = StudentProfile.objects.filter(user=user).select_related('course').first()
        course_title = student_profile.course.title if student_profile and student_profile.course else ""
        return Response({
            **tokens,
            "user": {
                "username": user.username,
                "email": user.email,
                "name": user.first_name or user.username,
                "role": user.role or "student",
                "course": course_title if user.role == 'student' else ""
            },
        })

    return Response({"error": "Invalid OTP"}, status=400)
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
    studentId = request.data.get("studentId")
    password = request.data.get("password")
    email = request.data.get("email", "")
    role = request.data.get("role", "student").strip().lower()
    course = request.data.get("course", "")
    phone_number = request.data.get("phone_number", "")

    print(f"DEBUG REGISTER: username={username}, password={password}, email={email}, role={role}, course={course}")

    if not username or not password:
        return Response({"error": "Student ID and password required"}, status=400)

    existing_user = User.objects.filter(username=username).first()
    if existing_user:
        if existing_user.is_active:
            return Response({"error": "Username already exists and is active. Please login."}, status=400)
        
        # If it's an inactive faculty, we allow "re-registering" to get a new OTP
        if existing_user.role == 'faculty':
            user = existing_user
            print(f"DEBUG: Allowing re-registration/OTP resend for inactive faculty {username}")
        else:
            return Response({"error": "Username already exists. Contact admin."}, status=400)
    else:
        # Create new user if doesn't exist
        is_active = False if role == 'faculty' else True
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            is_active=is_active
        )
        user.role = role
        user.save()
        
        # Create StudentProfile with course for students
        if role == 'student' and course:
            from myapp.models import StudentProfile, Course
            
            # Create course if it doesn't exist
            course_obj, created = Course.objects.get_or_create(
                title=course,
                defaults={
                    'level': 'Beginner',
                    'duration': 'Self-paced',
                    'topics': [f'Introduction to {course}'],
                    'progress': 0,
                    'locked': False
                }
            )
            if created:
                print(f"DEBUG: Created new course: {course}")
            else:
                print(f"DEBUG: Using existing course: {course}")
            
            student_profile = StudentProfile.objects.create(user=user, course=course_obj)
            print(f"DEBUG: Created student profile for {username} with course: {course}")

    if role == 'faculty':
        # Generate & Send OTP for verification
        otp = str(random.randint(100000, 999999))
        OTP.objects.create(username=username, email=email, otp=otp)
        
        try:
            subject = f"Verify Your Faculty Account - {settings.PLATFORM_NAME}"
            message = f"Hello {username},\n\nThank you for registering as faculty. To activate your account, please use the following OTP:\n\nOTP: {otp}\n\nDo not share this code."
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            print(f"DEBUG: Registration OTP {otp} sent to {email}")
            return Response({
                "message": "Registration successful. Please verify your OTP to activate your account.",
                "user": {"username": username, "role": role},
                "verification_required": True
            })
        except Exception as e:
            print(f"DEBUG: Failed to send registration email: {e}")
            # Even if email fails, account is created (but inactive)
            return Response({
                "message": "Account created, but failed to send verification email. Please contact admin.",
                "verification_required": True
            }, status=201)

    # Student flow (immediate login)
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