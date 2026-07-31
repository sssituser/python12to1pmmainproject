from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from myapp.models import StudentProfile
from myapp.email_utils import send_account_creation_email
import threading

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_users_api(request):
    """Get all users with their profiles"""
    try:
        users = User.objects.all()
        users_data = []
        
        for user in users:
            try:
                role_val = getattr(user, 'role', 'student') or 'student'
                
                user_data = {
                    'id': user.id,
                    'username': user.username or '',
                    'email': user.email or '',
                    'first_name': user.first_name or '',
                    'last_name': user.last_name or '',
                    'role': str(role_val).lower(),
                    'is_active': bool(user.is_active),
                    'is_staff': bool(user.is_staff),
                    'date_joined': user.date_joined,
                    'last_login': user.last_login
                }
                
                from myapp.models import StudentProfile, CourseEnrollment
                
                # Fetch student profile safely (auto-create if student role)
                profile = None
                try:
                    profile = StudentProfile.objects.filter(user=user).exclude(student_id__isnull=True).select_related('course').first()
                    if not profile:
                        profile = StudentProfile.objects.filter(user=user).select_related('course').first()
                    if not profile and (str(role_val).lower() == 'student'):
                        profile, _ = StudentProfile.objects.get_or_create(user=user)
                except Exception as p_err:
                    print(f"DEBUG all_users_api error fetching profile for user {user.id}: {p_err}")

                # Fetch course enrollments safely
                all_enrollments = []
                try:
                    all_enrollments = list(CourseEnrollment.objects.filter(user=user).select_related('batch', 'course'))
                except Exception:
                    pass

                enrolled_courses = []
                for e in all_enrollments:
                    try:
                        if e.course:
                            b_id = None
                            b_name = None
                            try:
                                if e.batch:
                                    b_id = e.batch.id
                                    b_name = getattr(e.batch, 'batch_name', None) or getattr(e.batch, 'name', None) or f"Batch #{e.batch.id}"
                            except Exception:
                                pass
                            
                            enrolled_courses.append({
                                'id': e.course.id,
                                'title': getattr(e.course, 'title', None) or getattr(e.course, 'name', 'Course'),
                                'batch_id': b_id,
                                'batch_name': b_name
                            })
                    except Exception:
                        pass
                
                # Collect all assigned batch IDs across profile and enrollments
                batch_ids_list = []
                try:
                    if profile and profile.batch_id:
                        batch_ids_list.append(profile.batch_id)
                except Exception:
                    pass

                for e in all_enrollments:
                    try:
                        if e.batch_id and e.batch_id not in batch_ids_list:
                            batch_ids_list.append(e.batch_id)
                    except Exception:
                        pass

                if profile:
                    # Auto-generation commented out: Student ID is assigned manually by admin

                    user_data['student_id'] = getattr(profile, 'student_id', None)
                    user_data['studentId'] = getattr(profile, 'student_id', None)
                    print(f"DEBUG all_users_api: user={user.username}({user.id}) profile_id={profile.id} student_id={profile.student_id}")
                    enrollment = all_enrollments[0] if len(all_enrollments) > 0 else None
                    
                    course_obj = None
                    try:
                        course_obj = profile.course
                    except Exception:
                        pass
                    if not course_obj and enrollment:
                        try:
                            course_obj = enrollment.course
                        except Exception:
                            pass
                            
                    course_title = getattr(course_obj, 'title', None) if course_obj else None
                    course_id = getattr(course_obj, 'id', None) if course_obj else None
                    
                    batch_id = None
                    batch_name = None
                    try:
                        p_batch = getattr(profile, 'batch', None)
                        if p_batch:
                            batch_id = p_batch.id
                            batch_name = getattr(p_batch, 'batch_name', None) or getattr(p_batch, 'name', None)
                    except Exception:
                        pass

                    if not batch_id and enrollment:
                        try:
                            if enrollment.batch:
                                batch_id = enrollment.batch.id
                                batch_name = getattr(enrollment.batch, 'batch_name', None) or getattr(enrollment.batch, 'name', None)
                        except Exception:
                            pass
                    
                    user_data['studentprofile'] = {
                        'student_id': getattr(profile, 'student_id', None),
                        'studentId': getattr(profile, 'student_id', None),
                        'course': {
                            'title': course_title,
                            'id': course_id
                        } if course_obj else None,
                        'course_name': course_title,
                        'batch': batch_id,
                        'batch_name': batch_name,
                        'assigned_batches': batch_ids_list,
                        'enrolled_courses': enrolled_courses
                    }
                else:
                    user_data['student_id'] = None
                    user_data['studentId'] = None
                    user_data['studentprofile'] = None
                
                user_data['enrolled_courses'] = enrolled_courses
                users_data.append(user_data)
            except Exception as user_err:
                print(f"Error processing user {getattr(user, 'id', 'unknown')}: {user_err}")
                try:
                    users_data.append({
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'role': getattr(user, 'role', 'student') or 'student',
                        'is_active': user.is_active,
                        'is_staff': user.is_staff,
                        'date_joined': user.date_joined,
                        'last_login': user.last_login,
                        'student_id': None,
                        'studentprofile': None,
                        'assigned_batches': [],
                        'enrolled_courses': []
                    })
                except Exception:
                    pass
        
        return Response(users_data)
    except Exception as e:
        print("Error in all_users_api:", e)
        return Response({'error': str(e)}, status=500)
        print(f"Error in all_users_api: {e}")
        return Response([], status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_faculty_api(request):
    """Create a new faculty user"""
    data = request.data
    
    # Check if username or email already exists
    if User.objects.filter(username=data['username']).exists():
        return Response({'error': 'Username already exists'}, status=400)
    
    if User.objects.filter(email=data['email']).exists():
        return Response({'error': 'Email already exists'}, status=400)
    
    # Create faculty user
    faculty = User.objects.create(
        username=data['username'],
        email=data['email'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        password=make_password(data['password']),
        role='faculty',
        is_active=True,
        is_staff=False
    )
    
    # Send email notification with password
    try:
        threading.Thread(
            target=send_account_creation_email,
            args=(data['email'], data['username'], data['password'], 'faculty')
        ).start()
    except Exception as e:
        print(f"Error starting email thread: {e}")

    return Response({
        'success': True,
        'message': 'Faculty created successfully',
        'faculty_id': faculty.id
    })

@api_view(['PATCH', 'PUT', 'POST'])
@permission_classes([IsAuthenticated])
def toggle_student_status_api(request, student_id):
    """Toggle student active/blocked status"""
    try:
        student = User.objects.filter(id=student_id).first()
        if not student:
            return Response({'error': 'User not found'}, status=404)

        if 'is_active' in request.data:
            student.is_active = bool(request.data['is_active'])
        else:
            student.is_active = not student.is_active
        student.save()
        
        return Response({
            'success': True,
            'message': f'User {"unblocked" if student.is_active else "blocked"} successfully',
            'is_active': student.is_active
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['PATCH', 'PUT', 'POST'])
@permission_classes([IsAuthenticated])
def toggle_faculty_status_api(request, faculty_id):
    """Toggle faculty active/blocked status"""
    try:
        faculty = User.objects.filter(id=faculty_id, role='faculty').first()
        if not faculty:
            # Fallback check by id
            faculty = User.objects.filter(id=faculty_id).first()
        if not faculty:
            return Response({'error': 'Faculty user not found'}, status=404)

        if 'is_active' in request.data:
            faculty.is_active = bool(request.data['is_active'])
        else:
            faculty.is_active = not faculty.is_active
        faculty.save()
        
        return Response({
            'success': True,
            'message': f'Faculty {"activated" if faculty.is_active else "deactivated"} successfully',
            'is_active': faculty.is_active
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user_api(request, user_id):
    """Delete a user (faculty or student)"""
    try:
        user = User.objects.get(id=user_id)
        if getattr(user, 'role', '') == 'student':
            from myapp.views.student_approval_views import log_student_audit
            log_student_audit(
                student_name=user.get_full_name() or user.username,
                action_type='deleted',
                action_title='Student Account Deleted',
                performed_by=request.user.username if (request.user and request.user.is_authenticated) else 'Admin',
                student_email=user.email,
                user_id=user.id,
                details='Student record deleted by admin'
            )
        user.delete()
        
        return Response({
            'success': True,
            'message': 'User deleted successfully'
        })
        
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_faculty_api(request, faculty_id):
    """Update faculty user information"""
    try:
        faculty = User.objects.get(id=faculty_id, role='faculty')
        data = request.data
        
        # Update fields
        if 'email' in data:
            # Check if email is being changed and if new email already exists
            if data['email'] != faculty.email and User.objects.filter(email=data['email']).exists():
                return Response({'error': 'Email already exists'}, status=400)
            faculty.email = data['email']
        
        if 'first_name' in data:
            faculty.first_name = data['first_name']
        
        if 'last_name' in data:
            faculty.last_name = data['last_name']
        
        if 'password' in data and data['password']:
            faculty.password = make_password(data['password'])
        
        if 'is_active' in data:
            faculty.is_active = data['is_active']
        
        faculty.save()
        
        return Response({
            'success': True,
            'message': 'Faculty updated successfully'
        })
        
    except User.DoesNotExist:
        return Response({'error': 'Faculty not found'}, status=404)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_student_api(request, student_id):
    """Update student user information and profile"""
    try:
        student = User.objects.get(id=student_id, role='student')
        data = request.data
        
        # Update user fields
        if 'username' in data:
            if data['username'] != student.username and User.objects.filter(username=data['username']).exists():
                return Response({'error': 'Username already exists'}, status=400)
            student.username = data['username']

        if 'email' in data:
            if data['email'] != student.email and User.objects.filter(email=data['email']).exists():
                return Response({'error': 'Email already exists'}, status=400)
            student.email = data['email']
        
        if 'first_name' in data:
            student.first_name = data['first_name']
        
        if 'last_name' in data:
            student.last_name = data['last_name']
        
        if 'password' in data and data['password']:
            student.password = make_password(data['password'])
            
        if 'is_active' in data:
            student.is_active = data['is_active']
            
        student.save()
        
        # Get the profile that already has a student_id set, or create one
        profile = StudentProfile.objects.filter(user=student).order_by('-student_id').first()
        if not profile:
            profile = StudentProfile.objects.create(user=student)

        # ── Handle student_id assignment ──────────────────────────────────────
        final_student_id = profile.student_id  # preserve existing by default
        if 'student_id' in data:
            student_id_val = data['student_id']
            print(f"DEBUG update_student_api: student_id incoming={student_id_val!r} for user={student.username}({student.id})")
            if student_id_val is not None and str(student_id_val).strip() != "":
                import re
                digits = re.sub(r'\D', '', str(student_id_val).strip())
                if digits:
                    target_num = int(digits)
                    if StudentProfile.objects.filter(student_id=target_num).exclude(user=student).exists():
                        return Response({'error': f'Student ID {target_num} is already assigned to another student. Student ID must be unique.'}, status=400)
                    final_student_id = target_num
            else:
                final_student_id = None

        # ── Handle course ─────────────────────────────────────────────────────
        if 'course_id' in data:
            course_id_val = data['course_id']
            if course_id_val and str(course_id_val).strip() != "":
                from myapp.models import Course
                try:
                    profile.course = Course.objects.get(id=course_id_val)
                except (Course.DoesNotExist, ValueError):
                    profile.course = None
            else:
                profile.course = None

        # ── Handle batch ──────────────────────────────────────────────────────
        if 'batch_id' in data or 'assigned_batches' in data:
            batch_id_val = data.get('batch_id')
            assigned_batches = data.get('assigned_batches', [])
            target_batch_id = None
            if batch_id_val and str(batch_id_val).strip() != "":
                target_batch_id = batch_id_val
            elif isinstance(assigned_batches, list) and len(assigned_batches) > 0:
                target_batch_id = assigned_batches[0]

            if target_batch_id:
                from myapp.models import Batch, CourseEnrollment
                try:
                    batch_obj = Batch.objects.get(id=target_batch_id)
                    profile.batch = batch_obj
                    enrollments = CourseEnrollment.objects.filter(user=student)
                    for en in enrollments:
                        en.batch = batch_obj
                        en.save()
                    if profile.course and not enrollments.exists():
                        CourseEnrollment.objects.get_or_create(
                            user=student,
                            course=profile.course,
                            defaults={'batch': batch_obj}
                        )
                except Exception as batch_err:
                    print("Error updating student batch:", batch_err)
            else:
                profile.batch = None

        # ── Persist all profile changes atomically ────────────────────────────
        # Only update fields that were explicitly sent in this request
        update_fields = {'student_id': final_student_id}
        if 'course_id' in data:
            update_fields['course'] = profile.course
        
        StudentProfile.objects.filter(user=student).update(**update_fields)

        print(f"DEBUG update_student_api: FINAL student_id saved = {final_student_id}")
        # Reload profile for response
        profile.refresh_from_db()

        from myapp.views.student_approval_views import log_student_audit
        log_student_audit(
            student_name=student.get_full_name() or student.username,
            action_type='updated',
            action_title='Profile / Student ID Updated',
            performed_by=request.user.username if (request.user and request.user.is_authenticated) else 'Admin',
            student_email=student.email,
            student_id_val=final_student_id or student.id,
            user_id=student.id,
            details=f"Updated Student ID to {final_student_id or 'N/A'}"
        )
            
        return Response({
            'success': True,
            'message': 'Student updated successfully',
            'student_id': profile.student_id
        })
        
    except User.DoesNotExist:
        return Response({'error': 'Student not found'}, status=404)
    except Exception as general_err:
        print("Error updating student:", general_err)
        return Response({'error': f'Failed to update student: {str(general_err)}'}, status=400)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def toggle_faculty_status_api(request, faculty_id):
    """Toggle faculty active/blocked status"""
    try:
        faculty = User.objects.get(id=faculty_id, role='faculty')
        faculty.is_active = not faculty.is_active
        faculty.save()
        
        return Response({
            'success': True,
            'message': f'Faculty {"unblocked" if faculty.is_active else "blocked"} successfully',
            'is_active': faculty.is_active
        })
        
    except User.DoesNotExist:
        return Response({'error': 'Faculty not found'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_student_api(request):
    """Create a new student user and profile"""
    data = request.data
    
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name', '')
    last_name = data.get('last_name', '')
    student_id_val = data.get('student_id')
    course_id = data.get('course_id')
    
    if not username or not email or not password:
        return Response({'error': 'Username, email, and password are required'}, status=400)
    
    # Check if username or email already exists
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=400)
    
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists'}, status=400)
    
    try:
        # Create student user
        student = User.objects.create(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=make_password(password),
            role='student',
            is_active=True,
            is_staff=False
        )
        
        # Handle student_id (validate uniqueness or assign manually)
        processed_student_id = None
        if student_id_val is not None and str(student_id_val).strip() != "":
            cleaned_val = str(student_id_val).strip()
            import re
            digits = re.sub(r'\D', '', cleaned_val)
            if digits:
                candidate_id = int(digits)
                if StudentProfile.objects.filter(student_id=candidate_id).exists():
                    student.delete()
                    return Response({'error': f'Student ID {candidate_id} is already in use. Student ID must be unique.'}, status=400)
                processed_student_id = candidate_id

        # Auto-generation commented out: assigned manually by admin
        # if not processed_student_id:
        #     candidate_id = 900000 + student.id
        #     while StudentProfile.objects.filter(student_id=candidate_id).exists():
        #         candidate_id += 1
        #     processed_student_id = candidate_id
        
        # Create student profile
        profile = StudentProfile.objects.create(
            user=student,
            student_id=processed_student_id
        )

        # Handle course and batch linking
        if course_id and str(course_id).strip() != "":
            from myapp.models import Course, CourseEnrollment, Batch
            try:
                course = Course.objects.get(id=course_id)
                profile.course = course
                profile.save()

                # Fetch batch if batch_id provided
                batch_id = data.get('batch_id')
                batch_obj = None
                if batch_id:
                    batch_obj = Batch.objects.filter(id=batch_id).first()

                # Create course enrollment
                CourseEnrollment.objects.get_or_create(
                    user=student,
                    course=course,
                    defaults={
                        'batch': batch_obj,
                        'status': 'Active',
                        'progress': 0,
                        'completion_percentage': 0.0
                    }
                )
            except (Course.DoesNotExist, ValueError):
                pass
        
        # Send email notification with password
        try:
            threading.Thread(
                target=send_account_creation_email,
                args=(email, username, password, 'student')
            ).start()
        except Exception as e:
            print(f"Error starting email thread: {e}")

        from myapp.views.student_approval_views import log_student_audit
        log_student_audit(
            student_name=student.get_full_name() or student.username,
            action_type='created',
            action_title='Student Account Created',
            performed_by=request.user.username if (request.user and request.user.is_authenticated) else 'Admin',
            student_email=student.email,
            student_id_val=processed_student_id or student.id,
            user_id=student.id,
            details=f"Created with Student ID: {processed_student_id or 'Auto'}"
        )

        return Response({
            'success': True,
            'message': 'Student created successfully',
            'student_id': student.id
        })
    except Exception as e:
        # Cleanup user if profile creation fails
        if 'student' in locals():
            student.delete()
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def database_backup_api(request):
    """Generates a SQL dump of all database tables and returns it as a downloadable file"""
    user_role = getattr(request.user, 'role', '')
    if not (request.user.is_staff or user_role in ['admin', 'superadmin']):
        return Response({'error': 'Unauthorized. Admin privileges required.'}, status=403)
    
    import io
    import datetime
    from django.db import connection
    from django.http import HttpResponse

    try:
        out = io.StringIO()
        cursor = connection.cursor()
        
        # Get all table names
        table_names = connection.introspection.table_names()
        
        out.write("-- SSSIT Placement Portal Database Backup\n")
        out.write(f"-- Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        out.write(f"-- Database Engine: {connection.vendor}\n\n")
        
        # Disable foreign key checks for clean restore
        if connection.vendor == 'mysql':
            out.write("SET FOREIGN_KEY_CHECKS = 0;\n\n")
        elif connection.vendor == 'sqlite':
            out.write("PRAGMA foreign_keys = OFF;\n\n")
            
        for table_name in table_names:
            out.write(f"-- ------------------------------------------------------\n")
            out.write(f"-- Table structure for table `{table_name}`\n")
            out.write(f"-- ------------------------------------------------------\n")
            out.write(f"DROP TABLE IF EXISTS `{table_name}`;\n")
            
            # Retrieve CREATE TABLE structure
            if connection.vendor == 'mysql':
                try:
                    cursor.execute(f"SHOW CREATE TABLE `{table_name}`")
                    create_stmt = cursor.fetchone()[1]
                    out.write(f"{create_stmt};\n\n")
                except Exception as e:
                    out.write(f"-- Error retrieving structure: {str(e)}\n\n")
            else:
                out.write(f"-- Table structure extraction not supported for {connection.vendor}. Skipping structure.\n\n")
            
            # Retrieve data rows
            cursor.execute(f"SELECT * FROM `{table_name}`")
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
            
            if rows:
                out.write(f"-- Dumping data for table `{table_name}`\n")
                col_str = ", ".join([f"`{c}`" for c in columns])
                
                for row in rows:
                    values = []
                    for val in row:
                        if val is None:
                            values.append("NULL")
                        elif isinstance(val, (int, float)):
                            values.append(str(val))
                        elif isinstance(val, (datetime.datetime, datetime.date)):
                            values.append(f"'{val}'")
                        elif isinstance(val, bool):
                            values.append("1" if val else "0")
                        else:
                            # Escape text/bytes values
                            escaped = str(val).replace("\\", "\\\\").replace("'", "\\'")
                            escaped = escaped.replace("\n", "\\n").replace("\r", "\\r")
                            values.append(f"'{escaped}'")
                    
                    val_str = ", ".join(values)
                    out.write(f"INSERT INTO `{table_name}` ({col_str}) VALUES ({val_str});\n")
                out.write("\n")
                
        # Re-enable foreign key checks
        if connection.vendor == 'mysql':
            out.write("SET FOREIGN_KEY_CHECKS = 1;\n")
        elif connection.vendor == 'sqlite':
            out.write("PRAGMA foreign_keys = ON;\n")
            
        sql_content = out.getvalue()
        
        response = HttpResponse(sql_content, content_type='application/sql')
        filename = f"db_backup_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.sql"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
        
    except Exception as e:
        return Response({'error': f'Failed to generate database backup: {str(e)}'}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deduplicate_courses_api(request):
    """
    Permanently remove duplicate Course rows from the database.
    Keeps only the row with the lowest id for each unique (case-insensitive) title.
    """
    try:
        from myapp.models import Course

        all_courses = Course.objects.all().order_by('id')
        seen_titles = {}
        ids_to_delete = []

        for course in all_courses:
            title = (course.title or '').strip().upper()
            if not title:
                # Delete courses with empty/blank titles
                ids_to_delete.append(course.id)
            elif title in seen_titles:
                # Duplicate — mark for deletion
                ids_to_delete.append(course.id)
            else:
                seen_titles[title] = course.id

        deleted_count = 0
        if ids_to_delete:
            deleted_count, _ = Course.objects.filter(id__in=ids_to_delete).delete()

        return Response({
            'success': True,
            'message': f'Removed {deleted_count} duplicate/blank course entries.',
            'deleted_count': deleted_count,
            'remaining_count': Course.objects.count()
        })
    except Exception as e:
        return Response({'error': f'Failed to deduplicate courses: {str(e)}'}, status=500)

