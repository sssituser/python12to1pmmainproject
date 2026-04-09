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
    
    # 📉 DB DIAGNOSTIC (Print total counts to see if DB is even populated)
    print(f"DIAGNOSTIC: User count={User.objects.count()}, Profile count={StudentProfile.objects.count()}")
    
    # 🔍 SUPER LOOKUP: Exhaustive user discovery across all identifiers
    try:
        # Sanitize inputs
        clean_sid = str(studentId).strip() if studentId else ""
        clean_user = str(username).strip() if username else ""
        identifier = clean_sid if clean_sid else clean_user
        
        if identifier:
            # 1. Direct User Table Match (Username/Email)
            user = User.objects.filter(Q(username__iexact=identifier) | Q(email__iexact=identifier)).first()
            
            # 2. StudentProfile student_id Match (Integer conversion)
            if not user and identifier.isdigit():
                profile = StudentProfile.objects.filter(student_id=int(identifier)).select_related('user').first()
                if profile:
                    user = profile.user
            
            # 3. StudentProfile Phone Match
            if not user:
                profile = StudentProfile.objects.filter(phone=identifier).select_related('user').first()
                if profile:
                    user = profile.user
                    
            # 4. Final Fallback: Check if username/email was stored in the other field
            if not user and clean_user:
                 user = User.objects.filter(Q(username__iexact=clean_user) | Q(email__iexact=clean_user)).first()

        if user:
            print(f"DEBUG: Identified user {user.username} via Super Lookup")
        else:
            print(f"DEBUG: Super Lookup failed for identifier: '{identifier}'")
            
    except Exception as e:
        print(f"DEBUG: Critical error during Super Lookup: {e}")
        return Response({"detail": "Error identifying user."}, status=500)

    required_role = request.data.get("role")

    if user:
        # 🔐 Verify password FIRST before checking active status
        password_valid = user.check_password(password)
        
        # 🩹 SELF-HEALING: If password check fails but we suspect a plain-text password in DB
        if not password_valid and user.password == password:
            print(f"🛠️ AUTO-REPAIR: User {user.username} has a PLAIN-TEXT password. Hashing and fixing now...")
            user.set_password(password)
            user.save()
            password_valid = True # Mark as valid since it matched exactly before hashing
            print(f"✅ AUTO-REPAIR: User {user.username} password has been hashed and updated.")
        
        print(f"DEBUG: User found: {user.username}, Password valid: {password_valid}")
        
        if not password_valid:
            return Response({"detail": "Invalid credentials. Please check your Student ID and Password."}, status=401)
            
        # 🛡️ Role separation check
        if required_role:
            user_role = (user.role or "student").lower().strip()
            req_role = required_role.lower().strip()
            
            print(f"DEBUG: Role check - User: {user_role}, Required: {req_role}")
            
            if req_role == "student" and user_role != "student":
                print(f"DEBUG: Role mismatch (403) - Found {user_role}")
                return Response({"detail": "This portal is for students only. Faculty members must use the Faculty Portal."}, status=403)
            
            if req_role == "faculty" and user_role not in ["faculty", "admin"]:
                print(f"DEBUG: Role mismatch (403) - Found {user_role}")
                return Response({"detail": "This portal is for faculty and admins only. Students must use the Student Portal."}, status=403)
        
        # 🔒 Lock check
        if user.role == 'student':
            profile = StudentProfile.objects.filter(user=user).first()
            if profile and hasattr(profile, 'is_locked') and profile.is_locked:
                 return Response({"detail": "Your account is locked. Please contact support."}, status=403)

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
        
        tokens = get_tokens(user)
        print(f"DEBUG: Tokens generated for {user.username}")
        user_email = user.email or ""
        login_time = timezone.now().strftime("%Y-%m-%d %H:%M:%S")
        user_ip = get_client_ip(request)
        browser_info = get_browser_info(request)

        # 🚀 ASYNC EMAIL SENDING (Prevents login lag)
        import threading
        if user_email:
            try:
                email_thread = threading.Thread(
                    target=send_login_email,
                    args=(user_email, username or user.username, login_time, user_ip, browser_info, user)
                )
                email_thread.daemon = True
                email_thread.start()
                print(f"DEBUG: Login email triggered in background for {user.username}")
            except Exception as e:
                print(f"DEBUG: Failed to start email thread: {e}")

        # 🏎️ OPTIMIZED PROFILE LOOKUP
        student_profile = None
        if user.role == 'student':
            student_profile = StudentProfile.objects.filter(user=user).select_related('course').first()

        response_data = {
            **tokens,
            "user": {
                "username": user.username,
                "email": user_email,
                "name": user.first_name or user.username,
                "role": user.role or "unknown",
                "course": student_profile.course.title if student_profile and student_profile.course else "",
                "enrolled_courses": student_profile.enrolled_courses_titles() if student_profile else []
            },
            "email_sent": True
        }
        
        # Add studentId to response for students
        if user.role == 'student' and student_profile:
            if student_profile.student_id:
                response_data["user"]["studentId"] = student_profile.student_id
        
        print(f"DEBUG: Response data successful for {user.username}")
        return Response(response_data)
    else:
        print(f"DEBUG: No user found for input (username={username}, studentId={studentId})")

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

    subject = f"Your OTP for {settings.PLATFORM_NAME}"
    message = f"Hello {user.username if user else 'User'},\n\nYour One-Time Password (OTP) for login is: {otp}\n\nThis code will expire shortly. Do not share it with anyone."
    
    # 🚀 ASYNC OTP EMAIL (Prevents UI hang)
    import threading
    def send_async_otp():
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [target_email],
                fail_silently=False,
            )
            print(f"DEBUG: OTP {otp} sent successfully to {target_email}")
        except Exception as e:
            print(f"DEBUG: Failed to send OTP email: {e}")

    email_thread = threading.Thread(target=send_async_otp)
    email_thread.daemon = True
    email_thread.start()

    return Response({"message": "OTP sent successfully"})


# ✅ VERIFY OTP
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    identifier = request.data.get("username")
    otp = request.data.get("otp")
    role = request.data.get("role")

    record = OTP.objects.filter(Q(username=identifier) | Q(email=identifier), otp=otp).last()

    if record:
        user = User.objects.filter(Q(username=identifier) | Q(email=identifier)).first()
        if not user:
            return Response({"error": "Invalid OTP"}, status=400)
            
        # 🛡️ Role separation check
        if role:
            user_role = (user.role or "student").lower().strip()
            req_role = role.lower().strip()
            
            if req_role == "student" and user_role != "student":
                return Response({"error": "This portal is for students only. Faculty members must use the Faculty Portal."}, status=403)
            
            if req_role == "faculty" and user_role not in ["faculty", "admin"]:
                return Response({"error": "This portal is for faculty and admins only. Students must use the Student Portal."}, status=403)
        # ✅ ACTIVATE USER ON SUCCESSFUL OTP
        if not user.is_active:
            user.is_active = True
            user.save(update_fields=['is_active'])

        tokens = get_tokens(user)
        # 🏎️ OPTIMIZED PROFILE LOOKUP
        student_profile = StudentProfile.objects.filter(user=user).select_related('course').first()
        course_title = student_profile.course.title if student_profile and student_profile.course else ""
        
        return Response({
            **tokens,
            "user": {
                "username": user.username,
                "email": user.email,
                "name": user.first_name or user.username,
                "role": user.role or "student",
                "course": course_title if user.role == 'student' else "",
                "enrolled_courses": student_profile.enrolled_courses_titles() if student_profile else ([course_title] if course_title else [])
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
    username = request.data.get("username", "").strip()
    studentId = request.data.get("studentId", "").strip() # 🔥 FIX: Explicitly get studentId
    password = request.data.get("password", "").strip()
    email = request.data.get("email", "").strip()
    role = request.data.get("role", "student").strip().lower()
    course = request.data.get("course", "")
    phone_number = request.data.get("phone_number", "")

    print(f"DEBUG REGISTER: username={username}, studentId={studentId}, role={role}")

    if not username or not password:
        return Response({"error": "Username and password required"}, status=400)

    # Check if a user already exists with this username OR email
    existing_user = User.objects.filter(Q(username=username) | Q(email=email)).first()
    if existing_user:
        if existing_user.is_active:
            return Response({"error": "User with this username or email already exists."}, status=400)
        
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
        
        # Normalize role for consistent checking
        role_normalized = role.lower().strip() if role else ""
        
        # Create StudentProfile with course(s) for students
        if role_normalized == 'student' and course:
            from myapp.models import StudentProfile, Course, CourseEnrollment
            
            # Handle multiple courses if 'course' is a list
            course_titles = course if isinstance(course, list) else [course]
            primary_course_obj = None
            
            for title in course_titles:
                # Create course if it doesn't exist
                course_obj, created = Course.objects.get_or_create(
                    title=title,
                    defaults={
                        'level': 'Beginner',
                        'duration': 'Self-paced',
                        'topics': [f'Introduction to {title}'],
                        'progress': 0,
                        'locked': False
                    }
                )
                if not primary_course_obj:
                    primary_course_obj = course_obj
                
                # Also create enrollment for each course
                CourseEnrollment.objects.get_or_create(user=user, course=course_obj)
            
            # 🛡️ ROBUST SYNC: Save studentId to profile and link courses
            sp_kwargs = {"user": user, "course": primary_course_obj}
            
            # Prioritize external studentId from request, fallback to username if numeric
            final_sid = studentId if studentId else (username if str(username).isdigit() else None)
            
            if final_sid and str(final_sid).isdigit():
                sp_kwargs["student_id"] = int(final_sid)
            elif phone_number:
                sp_kwargs["phone"] = phone_number
                
            student_profile = StudentProfile.objects.create(**sp_kwargs)
            print(f"DEBUG: Created profile for {username} with SID: {sp_kwargs.get('student_id', 'None')}")

    if role == 'faculty':
        # Generate & Send OTP for verification
        otp = str(random.randint(100000, 999999))
        OTP.objects.create(username=username, email=email, otp=otp)
        
        # 🚀 ASYNC REGISTRATION EMAIL
        import threading
        def send_async_reg_email():
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
            except Exception as e:
                print(f"DEBUG: Failed to send registration email: {e}")

        email_thread = threading.Thread(target=send_async_reg_email)
        email_thread.daemon = True
        email_thread.start()

        return Response({
            "message": "Registration successful. Please verify your OTP to activate your account.",
            "user": {"username": username, "role": role},
            "verification_required": True
        })

    # Student flow (immediate login)
    tokens = get_tokens(user)
    student_profile = StudentProfile.objects.filter(user=user).select_related('course').first()
    course_title = student_profile.course.title if student_profile and student_profile.course else course
    
    return Response({
        **tokens,
        "user": {
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "course": course_title if user.role == 'student' else "",
            "enrolled_courses": student_profile.enrolled_courses_titles() if (user.role.lower().strip() == 'student' if user.role else False) and student_profile else ([course] if isinstance(course, str) else course)
        },
        "message": "Registration successful"
    })