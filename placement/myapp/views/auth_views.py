import random
from datetime import timedelta
from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from myapp.throttles import LoginRateThrottle, OTPRateThrottle, RegisterRateThrottle
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from myapp.models import OTP, StudentProfile, Course, AdminNotification
from myapp.email_utils import send_login_email, send_plain_email
from django.conf import settings
from django.utils import timezone

User = get_user_model()


# 🔍 EXHAUSTIVE USER LOOKUP HELPER
def find_user_by_identifier(identifier):
    if not identifier:
        return None
    identifier = str(identifier).strip()
    
    # 1. Direct User Table Match (Username/Email, case-insensitive)
    user = User.objects.filter(Q(username__iexact=identifier) | Q(email__iexact=identifier)).first()
    if user:
        return user

    # 2. StudentProfile student_id Match (Integer conversion)
    if identifier.isdigit():
        profile = StudentProfile.objects.filter(student_id=int(identifier)).select_related('user').order_by('-user__is_active').first()
        if profile:
            return profile.user

    # 3. StudentProfile Phone Match
    profile = StudentProfile.objects.filter(phone=identifier).select_related('user').order_by('-user__is_active').first()
    if profile:
        return profile.user

    return None


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
@permission_classes([AllowAny])
@throttle_classes([LoginRateThrottle])
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
        
        user = find_user_by_identifier(identifier)
        if not user and clean_user:
            user = find_user_by_identifier(clean_user)

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
            if required_role == 'student':
                return Response({"detail": "Invalid credentials. Please check your Student ID and Password."}, status=401)
            elif required_role == 'faculty':
                return Response({"detail": "Invalid credentials. Please check your Faculty ID/Email and Password."}, status=401)
            else:
                return Response({"detail": "Invalid credentials. Please check your credentials and Password."}, status=401)

            
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
        
        # 🔒 Lock & Approval check
        if user.role == 'student':
            profile = StudentProfile.objects.filter(user=user).first()
            if profile:
                if hasattr(profile, 'is_locked') and profile.is_locked:
                    return Response({"detail": "Your account is locked. Please contact support."}, status=403)
                if profile.approval_status == 'pending':
                    return Response({"detail": "Your account is pending approval. Please wait until Faculty/Admin approves your account."}, status=403)
                elif profile.approval_status == 'rejected':
                    return Response({"detail": "Your registration has been rejected. Please contact the administrator."}, status=403)

        # ⚡ AUTO-ACTIVATE FACULTY & ADMIN ON CORRECT LOGIN (Fix for stuck/inactive accounts)
        if user.role in ['faculty', 'admin'] and not user.is_active:
            print(f"DEBUG: Auto-activating {user.role} account for {user.username}")
            user.is_active = True
            # We will save after updating last_login below
        
        # 🛡️ ADMINS ARE ALWAYS ALLOWED
        elif user.role == 'admin':
            print(f"DEBUG: Admin login detected for {user.username}")
            user.is_active = True
        
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

    if required_role == 'student':
        return Response({"detail": "Invalid credentials. Please check your Student ID and Password."}, status=401)
    elif required_role == 'faculty':
        return Response({"detail": "Invalid credentials. Please check your Faculty ID/Email and Password."}, status=401)
    else:
        return Response({"detail": "Invalid credentials"}, status=401)



# 🔢 SEND OTP

def _mask_email(email):
    """Return a privacy-masked version: ab***@gmail.com"""
    try:
        local, domain = email.split('@', 1)
        masked_local = local[:2] + '***' if len(local) > 2 else local[0] + '***'
        return f"{masked_local}@{domain}"
    except Exception:
        return '***@***.***'


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([OTPRateThrottle])
def send_otp(request):
    identifier = request.data.get("username")
    if not identifier:
        return Response({"error": "Identifier (username or email) is required"}, status=400)

    identifier = str(identifier).strip()

    # 🔍 Find user to get their email
    user = find_user_by_identifier(identifier)
    target_email = identifier if "@" in identifier else (user.email if user else None)

    if not target_email:
        return Response({"error": "No email address found for this account. Please enter your registered email address directly."}, status=400)

    if not user and '@' not in identifier:
        return Response({"error": "User not found. Please enter your registered email or username."}, status=404)

    # 🧹 Delete ALL previous OTPs for this user to prevent stale OTP confusion
    if user:
        OTP.objects.filter(Q(username=user.username) | Q(email=user.email)).delete()
    else:
        OTP.objects.filter(Q(username=identifier) | Q(email=identifier)).delete()

    otp = str(random.randint(100000, 999999))  # 6-digit OTP
    OTP.objects.create(
        username=user.username if user else identifier,
        email=target_email,
        otp=otp
    )

    subject = f"Your OTP for {settings.PLATFORM_NAME}"
    message = (
        f"Hello {user.username if user else 'User'},\n\n"
        f"Your One-Time Password (OTP) for login is:\n\n"
        f"  {otp}\n\n"
        f"This OTP is valid for 10 minutes. Do not share it with anyone.\n\n"
        f"If you did not request this, please ignore this email."
    )

    # ✉️ Send synchronously — threading caused silent failures
    print(f"DEBUG: Sending OTP email to {target_email}")
    sent = send_plain_email(subject, message, target_email)
    print(f"DEBUG: OTP email {'SENT OK' if sent else 'FAILED'} to {target_email}")

    if not sent:
        # Delete the OTP so the user isn't stuck with a code they can't receive
        OTP.objects.filter(
            Q(username=user.username if user else identifier) | Q(email=target_email),
            otp=otp
        ).delete()
        return Response({
            "error": "Failed to send OTP email. Please check your email address or try again later."
        }, status=500)

    return Response({
        "message": f"OTP sent to {_mask_email(target_email)}",
        "email_hint": _mask_email(target_email)
    })


# ✅ VERIFY OTP
@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([OTPRateThrottle])
def verify_otp(request):
    identifier = request.data.get("username")
    otp = request.data.get("otp")
    role = request.data.get("role")

    if not identifier or not otp:
        return Response({"error": "Identifier and OTP are required"}, status=400)

    identifier = str(identifier).strip()
    otp = str(otp).strip()

    user = find_user_by_identifier(identifier)

    # Find the OTP record by resolving the identifier or matching on the resolved user's credentials
    if user:
        record = OTP.objects.filter(
            Q(username=user.username) | Q(email=user.email) | Q(username=identifier) | Q(email=identifier),
            otp=otp
        ).last()
    else:
        record = OTP.objects.filter(Q(username=identifier) | Q(email=identifier), otp=otp).last()

    if not record:
        return Response({"error": "Invalid OTP. Please request a new one."}, status=400)

    # ⏰ OTP Expiry Check (10 minutes)
    otp_age = timezone.now() - record.created_at
    if otp_age.total_seconds() > 600:  # 10 minutes
        record.delete()
        return Response({"error": "OTP has expired. Please request a new one."}, status=400)

    if not user:
        user = User.objects.filter(Q(username__iexact=identifier) | Q(email__iexact=identifier)).first()
    if not user:
        return Response({"error": "User not found."}, status=400)

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

    # 🗑️ Delete used OTP record
    record.delete()

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


# 🔐 FORGOT PASSWORD WITH OTP VERIFICATION
@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([OTPRateThrottle])
def forgot_password_send_otp(request):
    """Step 1: Send OTP to email for password reset"""
    identifier = request.data.get("username")
    if not identifier:
        return Response({"error": "Username or email is required"}, status=400)

    identifier = str(identifier).strip()
    user = find_user_by_identifier(identifier)

    if not user:
        return Response({"error": "No account found with that username or email."}, status=404)

    target_email = user.email
    if not target_email:
        return Response({"error": "No email address is registered for this account. Please contact admin."}, status=400)

    # 🧹 Delete previous password-reset OTPs
    OTP.objects.filter(Q(username=user.username) | Q(email=user.email)).delete()

    otp = str(random.randint(100000, 999999))
    OTP.objects.create(username=user.username, email=target_email, otp=otp)

    subject = f"Password Reset OTP - {settings.PLATFORM_NAME}"
    message = (
        f"Hello {user.username},\n\n"
        f"We received a request to reset your password.\n\n"
        f"Your OTP is:\n\n"
        f"  {otp}\n\n"
        f"This OTP is valid for 10 minutes.\n"
        f"If you didn't request this, please ignore this email."
    )

    # ✉️ Send synchronously — threading caused silent failures
    print(f"DEBUG: Sending forgot-password OTP to {target_email}")
    sent = send_plain_email(subject, message, target_email)
    print(f"DEBUG: Forgot-password OTP {'SENT OK' if sent else 'FAILED'} for {user.username}")

    if not sent:
        OTP.objects.filter(username=user.username, otp=otp).delete()
        return Response({
            "error": "Failed to send OTP email. Please check that your account email is correct, or try again later."
        }, status=500)

    return Response({
        "message": f"OTP sent to {_mask_email(target_email)}",
        "email_hint": _mask_email(target_email)
    })


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([OTPRateThrottle])
def forgot_password_verify_otp_reset(request):
    """Step 2: Verify OTP and reset password in one call"""
    identifier = request.data.get("username")
    otp = request.data.get("otp")
    new_password = request.data.get("new_password")

    if not identifier or not otp or not new_password:
        return Response({"error": "Username, OTP, and new password are required"}, status=400)

    if len(new_password) < 8:
        return Response({"error": "Password must be at least 8 characters long"}, status=400)

    identifier = str(identifier).strip()
    otp = str(otp).strip()

    user = find_user_by_identifier(identifier)
    if not user:
        return Response({"error": "Invalid OTP or user not found."}, status=400)

    record = OTP.objects.filter(
        Q(username=user.username) | Q(email=user.email),
        otp=otp
    ).last()

    if not record:
        return Response({"error": "Invalid OTP. Please request a new one."}, status=400)

    # ⏰ Expiry check (10 minutes)
    otp_age = timezone.now() - record.created_at
    if otp_age.total_seconds() > 600:
        record.delete()
        return Response({"error": "OTP has expired. Please request a new one."}, status=400)

    # ✅ Reset password
    user.set_password(new_password)
    user.is_active = True  # Ensure account is active after reset
    user.save()

    # 🗑️ Delete used OTP
    record.delete()

    print(f"DEBUG: Password reset via OTP for {user.username}")
    return Response({"success": True, "message": "Password reset successfully. Please login with your new password."})
@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    identifier = request.data.get("username")
    password = request.data.get("password")

    user = find_user_by_identifier(identifier)

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
@throttle_classes([RegisterRateThrottle])
def register(request):
    username = request.data.get("username", "").strip()
    studentId = request.data.get("studentId", "").strip() # 🔥 FIX: Explicitly get studentId
    password = request.data.get("password", "").strip()
    email = request.data.get("email", "").strip()
    role = request.data.get("role", "student").strip().lower()
    course = request.data.get("course", "")
    phone_number = request.data.get("phone_number", "")
    first_name = request.data.get("first_name", "").strip()
    last_name = request.data.get("last_name", "").strip()

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
            first_name=first_name,
            last_name=last_name,
            is_active=is_active
        )
        user.role = role
        user.save()
        
        # Normalize role for consistent checking
        role_normalized = role.lower().strip() if role else ""
        
        # Create StudentProfile with course(s) for students
        if role_normalized == 'student':
            from myapp.models import StudentProfile, Course, CourseEnrollment
            
            # Handle multiple courses if 'course' is a list
            course_titles = course if isinstance(course, list) else [course] if course else []
            
            # Ensure "Aptitude and Reasoning" is in the course list
            aptitude_reasoning_title = "Aptitude and Reasoning"
            if aptitude_reasoning_title not in course_titles:
                course_titles.append(aptitude_reasoning_title)
            
            primary_course_obj = None
            
            batch_id = request.data.get("batch_id")
            batch_obj = None
            if batch_id:
                from myapp.models import Batch
                batch_obj = Batch.objects.filter(id=batch_id).first()

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
                    if course and title == aptitude_reasoning_title and len(course_titles) > 1:
                        pass
                    else:
                        primary_course_obj = course_obj
                
                # Also create enrollment for each course
                enrollment, _ = CourseEnrollment.objects.get_or_create(user=user, course=course_obj)
                if batch_obj and batch_obj.course_id == course_obj.id:
                    enrollment.batch = batch_obj
                    enrollment.save(update_fields=['batch'])
            
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

            # 🔔 CREATE ADMIN NOTIFICATION (in-panel)
            try:
                AdminNotification.objects.create(
                    notification_type='new_student',
                    title=f'New Student Registered: {username}',
                    message=(
                        f'A new student has just registered on the SSSIT LMS portal.\n'
                        f'Name: {username}\n'
                        f'Email: {email or "Not provided"}\n'
                        f'Student ID: {sp_kwargs.get("student_id", "Not provided")}\n'
                        f'Course: {", ".join(course_titles) if course_titles else "Not specified"}'
                    ),
                    related_username=username,
                    related_email=email or None,
                )
                print(f"DEBUG: Admin notification created for new student {username}")
            except Exception as notif_err:
                print(f"DEBUG: Failed to create admin notification: {notif_err}")

            # 📧 SEND EMAIL TO ALL ADMIN USERS (async)
            import threading
            def _notify_admins_email():
                try:
                    admin_users = User.objects.filter(role='admin', is_active=True).values_list('email', flat=True)
                    admin_emails = [e for e in admin_users if e]
                    if not admin_emails:
                        # Fallback to settings ADMIN_EMAIL if defined
                        fallback = getattr(settings, 'ADMIN_NOTIFICATION_EMAIL', None)
                        if fallback:
                            admin_emails = [fallback]
                    for admin_email in admin_emails:
                        subject = f"[SSSIT LMS] New Student Registration: {username}"
                        message = (
                            f"Hello Admin,\n\n"
                            f"A new student has registered on the SSSIT Learning Management Portal.\n\n"
                            f"Student Details:\n"
                            f"  Name       : {username}\n"
                            f"  Email      : {email or 'Not provided'}\n"
                            f"  Student ID : {sp_kwargs.get('student_id', 'Not provided')}\n"
                            f"  Course(s)  : {", ".join(course_titles) if course_titles else 'Not specified'}\n\n"
                            f"Please log in to the Admin Panel to review and manage this student.\n\n"
                            f"SSSIT LMS Team"
                        )
                        sent = send_plain_email(subject, message, admin_email)
                        print(f"DEBUG: Admin notification email {'SENT' if sent else 'FAILED'} to {admin_email}")
                except Exception as mail_err:
                    print(f"DEBUG: Admin email notification error: {mail_err}")

            admin_thread = threading.Thread(target=_notify_admins_email)
            admin_thread.daemon = True
            admin_thread.start()

    if role == 'faculty':
        # Generate & Send OTP for verification
        otp = str(random.randint(100000, 999999))
        OTP.objects.create(username=username, email=email, otp=otp)
        
        # 🚀 ASYNC REGISTRATION EMAIL
        import threading
        def send_async_reg_email():
            subject = f"Verify Your Faculty Account - {settings.PLATFORM_NAME}"
            message = f"Hello {username},\n\nThank you for registering as faculty. To activate your account, please use the following OTP:\n\nOTP: {otp}\n\nDo not share this code."
            sent = send_plain_email(subject, message, email)
            if sent:
                print(f"DEBUG: Registration OTP {otp} sent to {email}")
            else:
                print(f"DEBUG: Failed to send registration email to {email}")

        email_thread = threading.Thread(target=send_async_reg_email)
        email_thread.daemon = True
        email_thread.start()

        return Response({
            "message": "Registration successful. Please verify your OTP to activate your account.",
            "user": {"username": username, "role": role},
            "verification_required": True
        })

    # Student flow (immediate login blocked, status is pending)
    student_profile = StudentProfile.objects.filter(user=user).select_related('course').first()
    course_title = student_profile.course.title if student_profile and student_profile.course else course
    
    return Response({
        "message": "Registration successful. Your account has been created successfully. Please wait until the Faculty or Admin verifies your account.",
        "approval_required": True,
        "user": {
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "course": course_title if user.role == 'student' else "",
            "enrolled_courses": student_profile.enrolled_courses_titles() if (user.role.lower().strip() == 'student' if user.role else False) and student_profile else ([course] if isinstance(course, str) else course)
        }
    })