from rest_framework.decorators import api_view, permission_classes, authentication_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
import json

from ..models import StudentProfile, Skill, Project, FacultyProfile, FacultyAchievement, FacultyResearch, FacultyCourseHistory
from ..serializers import StudentProfileSerializer, FacultyProfileSerializer, FacultyProfilePublicSerializer, FacultyProfileMinimalSerializer


# =============================
# MINIMAL TEST ENDPOINT
# =============================

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def faculty_profile_minimal_test(request):
    """Minimal test for faculty profile API"""
    try:
        user = request.user
        return Response({
            'status': 'success',
            'user_id': user.id,
            'username': user.username,
            'user_role': getattr(user, 'role', 'unknown'),
            'message': 'Faculty profile API working'
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'error': str(e),
            'type': type(e).__name__
        }, status=500)


# =============================
# GET PROFILE
# =============================

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def profile_view(request):

    try:
        profile = StudentProfile.objects.get(user=request.user)
        print(f"DEBUG: Found existing profile for user {request.user.username}: {profile}")
    except StudentProfile.DoesNotExist:
        profile = StudentProfile.objects.create(user=request.user)
        print(f"DEBUG: Created new profile for user {request.user.username}: {profile}")
    
    serializer = StudentProfileSerializer(profile, context={"request": request})
    data = serializer.data
    data["name"] = request.user.get_full_name() or request.user.username
    data["email"] = request.user.email
    print(f"DEBUG: Serialized profile data: {data}")
    return Response(data)


# =============================
# UPDATE PROFILE (SMART UPDATE)
# =============================

@api_view(["PUT"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def update_profile(request):

    try:
        profile = StudentProfile.objects.get(user=request.user)
        print(f"DEBUG: Found existing profile for update: {profile}")
    except StudentProfile.DoesNotExist:
        profile = StudentProfile.objects.create(user=request.user)
        print(f"DEBUG: Created new profile for update: {profile}")
    
    user = request.user
    print(f"DEBUG: Received data: {request.data}")
    
    name = request.data.get("name")
    email = request.data.get("email")
    if name:
        user.first_name = name
    if email:
        user.email = email
    if name or email:
        user.save()

    skills_data = request.data.get("skills", [])
    projects_data = request.data.get("projects", [])
    raw_education = request.data.get("education", None)

    def parse_json_value(value):
        if isinstance(value, (list, tuple)) and len(value) == 1 and isinstance(value[0], str):
            value = value[0]
        if isinstance(value, bytes):
            try:
                value = value.decode("utf-8")
            except UnicodeDecodeError:
                return None
        if isinstance(value, str):
            trimmed = value.strip()
            if trimmed == "" or trimmed.lower() == "null":
                return None
            try:
                return json.loads(trimmed)
            except json.JSONDecodeError:
                return None
        return value

    # Parse JSON strings if they are strings
    if isinstance(skills_data, str):
        try:
            skills_data = json.loads(skills_data)
        except:
            skills_data = []
    if isinstance(projects_data, str):
        try:
            projects_data = json.loads(projects_data)
        except:
            projects_data = []

    education_data = parse_json_value(raw_education)

    def normalize_json_field(value):
        if isinstance(value, (list, tuple)) and len(value) == 1 and isinstance(value[0], str):
            value = value[0]
        if isinstance(value, bytes):
            try:
                value = value.decode('utf-8')
            except UnicodeDecodeError:
                return value
        if isinstance(value, str):
            trimmed = value.strip()
            if trimmed == "" or trimmed.lower() == "null":
                return None
            if trimmed.startswith("[") or trimmed.startswith("{"):
                try:
                    return json.loads(trimmed)
                except json.JSONDecodeError:
                    return value
        return value

    data = request.data.copy()
    data.pop("skills", None)
    data.pop("projects", None)
    data.pop("education", None)
    data.pop("name", None)
    data.pop("email", None)
    data.pop("profileImage", None)
    data.pop("profileImageUrl", None)
    data.pop("resumeUrl", None)

    allowed_fields = {
        "student_id",
        "age",
        "state",
        "phone",
        "parent_phone",
        "college",
        "year",
        "cgpa",
        "tenth_percentage",
        "twelfth_percentage",
        "github",
        "linkedin",
        "profile_image",
        "resume",
        "course",
    }

    for key in list(data.keys()):
        if key not in allowed_fields:
            data.pop(key, None)
        else:
            data[key] = normalize_json_field(data[key])

    # Handle course field before serializer
    if "course" in data and data["course"]:
        from myapp.models import Course
        course_name = data["course"]
        course_obj, created = Course.objects.get_or_create(
            title=course_name,
            defaults={
                'level': 'Beginner',
                'duration': 'Self-paced',
                'topics': [f'Introduction to {course_name}'],
                'progress': 0,
                'locked': False
            }
        )
        if created:
            print(f"DEBUG: Created new course from profile update: {course_name}")
        data["course"] = course_obj.id  # Set to course ID for serializer

    serializer = StudentProfileSerializer(profile, data=data, partial=True)

    if serializer.is_valid():
        serializer.save()
        
        if raw_education is not None and education_data is not None:
            profile.education = education_data
            profile.save(update_fields=["education"])

        # Skills
        sent_ids = [s.get("id") for s in skills_data if s.get("id")]

        for skill in profile.skills.all():
            if skill.id not in sent_ids:
                skill.delete()

        for s in skills_data:
            if s.get("id"):
                Skill.objects.filter(id=s["id"], student=profile).update(
                    name=s.get("name"),
                    level=s.get("level", 50),
                )
            else:
                Skill.objects.create(
                    student=profile,
                    name=s.get("name"),
                    level=s.get("level", 50),
                )

        # Projects
        sent_project_ids = [p.get("id") for p in projects_data if p.get("id")]

        for proj in profile.projects.all():
            if proj.id not in sent_project_ids:
                proj.delete()

        for p in projects_data:
            if p.get("id"):
                Project.objects.filter(id=p["id"], student=profile).update(
                    title=p.get("title"),
                    description=p.get("description"),
                )
            else:
                Project.objects.create(
                    student=profile,
                    title=p.get("title"),
                    description=p.get("description"),
                )

        return Response({"message": "Profile updated successfully"})

    return Response(serializer.errors, status=400)


# =============================
# UPLOAD RESUME
# =============================

@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def upload_resume(request):

    profile, _ = StudentProfile.objects.get_or_create(user=request.user)
    resume = request.FILES.get("resume")
    if not resume:
        return Response({"error": "No file"}, status=400)
    profile.resume = resume
    profile.save()
    return Response({"message": "Uploaded successfully"})


# =============================
# FACULTY PROFILE VIEWS
# =============================

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def faculty_profile_view(request):
    """Get faculty profile for the authenticated user"""
    
    try:
        profile = FacultyProfile.objects.get(user=request.user)
        serializer = FacultyProfileSerializer(profile, context={"request": request})
        return Response(serializer.data)
    except FacultyProfile.DoesNotExist:
        # Create default faculty profile
        profile = FacultyProfile.objects.create(
            user=request.user,
            first_name=request.user.first_name or '',
            last_name=request.user.last_name or '',
        )
        serializer = FacultyProfileSerializer(profile, context={"request": request})
        return Response(serializer.data)


@api_view(["PUT", "PATCH"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def faculty_profile_update(request):
    """Update faculty profile"""
    
    try:
        profile = FacultyProfile.objects.get(user=request.user)
    except FacultyProfile.DoesNotExist:
        return Response({"error": "Faculty profile not found"}, status=404)
    
    try:
        # Handle partial update for PATCH
        partial = request.method == 'PATCH'
        serializer = FacultyProfileSerializer(
            profile, 
            data=request.data, 
            partial=partial,
            context={"request": request}
        )
        
        if serializer.is_valid():
            updated_profile = serializer.save()
            return Response(serializer.data)
        else:
            # Provide detailed error information
            errors = serializer.errors
            error_messages = []
            for field, field_errors in errors.items():
                if isinstance(field_errors, list):
                    error_messages.extend([f"{field}: {error}" for error in field_errors])
                else:
                    error_messages.append(f"{field}: {field_errors}")
            
            return Response({
                "error": "Validation failed",
                "details": error_messages,
                "fields": errors
            }, status=400)
            
    except Exception as e:
        return Response({
            "error": f"Update failed: {str(e)}",
            "type": type(e).__name__
        }, status=500)


@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def faculty_avatar_upload(request):
    """Upload faculty avatar"""
    
    try:
        profile = FacultyProfile.objects.get(user=request.user)
    except FacultyProfile.DoesNotExist:
        return Response({"error": "Faculty profile not found"}, status=404)
    
    avatar = request.FILES.get("avatar")
    if not avatar:
        return Response({"error": "No avatar file provided"}, status=400)
    
    profile.avatar = avatar
    profile.save()
    
    return Response({
        "message": "Avatar uploaded successfully",
        "avatar_url": profile.avatar.url if profile.avatar else None
    })


@api_view(["DELETE"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def faculty_avatar_delete(request):
    """Delete faculty avatar"""
    
    try:
        profile = FacultyProfile.objects.get(user=request.user)
    except FacultyProfile.DoesNotExist:
        return Response({"error": "Faculty profile not found"}, status=404)
    
    if profile.avatar:
        profile.avatar.delete()
        profile.avatar = None
        profile.save()
    
    return Response({"message": "Avatar deleted successfully"})


@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def faculty_profile_public(request, profile_id):
    """Get public faculty profile (limited fields)"""
    
    try:
        profile = FacultyProfile.objects.get(id=profile_id, is_active=True)
        serializer = FacultyProfilePublicSerializer(profile)
        return Response(serializer.data)
    except FacultyProfile.DoesNotExist:
        return Response({"error": "Faculty profile not found"}, status=404)


@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def faculty_list_minimal(request):
    """Get minimal faculty list for dropdowns"""
    
    profiles = FacultyProfile.objects.filter(is_active=True)
    serializer = FacultyProfileMinimalSerializer(profiles, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def faculty_stats(request):
    """Get faculty statistics"""
    
    try:
        profile = FacultyProfile.objects.get(user=request.user)
        
        # Update stats safely
        try:
            profile.update_stats()
        except Exception as e:
            print(f"Error updating stats: {e}")
        
        # Get stats safely with fallbacks
        stats = {
            "courses_taught": profile.courses_taught,
            "students_mentored": profile.students_mentored,
            "publications_count": profile.publications_count,
            "experience_years": profile.experience_years,
        }
        
        # Add counts from related tables if they exist
        try:
            stats["achievements_count"] = profile.achievements.count()
        except:
            stats["achievements_count"] = 0
            
        try:
            stats["research_projects_count"] = profile.research_projects.count()
        except:
            stats["research_projects_count"] = 0
            
        try:
            stats["course_history_count"] = profile.course_history.count()
        except:
            stats["course_history_count"] = 0
        
        return Response(stats)
    except FacultyProfile.DoesNotExist:
        return Response({"error": "Faculty profile not found"}, status=404)


@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def faculty_achievement_add(request):
    """Add achievement to faculty profile"""
    
    try:
        profile = FacultyProfile.objects.get(user=request.user)
    except FacultyProfile.DoesNotExist:
        return Response({"error": "Faculty profile not found"}, status=404)
    
    serializer = FacultyAchievementSerializer(data=request.data)
    if serializer.is_valid():
        achievement = serializer.save(faculty_profile=profile)
        return Response(serializer.data, status=201)
    
    return Response(serializer.errors, status=400)


@api_view(["PUT", "DELETE"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def faculty_achievement_detail(request, achievement_id):
    """Update or delete faculty achievement"""
    
    try:
        profile = FacultyProfile.objects.get(user=request.user)
        achievement = FacultyAchievement.objects.get(id=achievement_id, faculty_profile=profile)
    except (FacultyProfile.DoesNotExist, FacultyAchievement.DoesNotExist):
        return Response({"error": "Achievement not found"}, status=404)
    
    if request.method == 'PUT':
        serializer = FacultyAchievementSerializer(achievement, data=request.data)
        if serializer.is_valid():
            updated_achievement = serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    elif request.method == 'DELETE':
        achievement.delete()
        return Response({"message": "Achievement deleted successfully"})


@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def faculty_research_add(request):
    """Add research project to faculty profile"""
    
    try:
        profile = FacultyProfile.objects.get(user=request.user)
    except FacultyProfile.DoesNotExist:
        return Response({"error": "Faculty profile not found"}, status=404)
    
    serializer = FacultyResearchSerializer(data=request.data)
    if serializer.is_valid():
        research = serializer.save(faculty_profile=profile)
        return Response(serializer.data, status=201)
    
    return Response(serializer.errors, status=400)


@api_view(["PUT", "DELETE"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def faculty_research_detail(request, research_id):
    """Update or delete faculty research project"""
    
    try:
        profile = FacultyProfile.objects.get(user=request.user)
        research = FacultyResearch.objects.get(id=research_id, faculty_profile=profile)
    except (FacultyProfile.DoesNotExist, FacultyResearch.DoesNotExist):
        return Response({"error": "Research project not found"}, status=404)
    
    if request.method == 'PUT':
        serializer = FacultyResearchSerializer(research, data=request.data)
        if serializer.is_valid():
            updated_research = serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    elif request.method == 'DELETE':
        research.delete()
        return Response({"message": "Research project deleted successfully"})


@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def faculty_course_history_add(request):
    """Add course history to faculty profile"""
    
    try:
        profile = FacultyProfile.objects.get(user=request.user)
    except FacultyProfile.DoesNotExist:
        return Response({"error": "Faculty profile not found"}, status=404)
    
    serializer = FacultyCourseHistorySerializer(data=request.data)
    if serializer.is_valid():
        history = serializer.save(faculty_profile=profile)
        return Response(serializer.data, status=201)
    
    return Response(serializer.errors, status=400)


@api_view(["PUT", "DELETE"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def faculty_course_history_detail(request, history_id):
    """Update or delete faculty course history"""
    
    try:
        profile = FacultyProfile.objects.get(user=request.user)
        history = FacultyCourseHistory.objects.get(id=history_id, faculty_profile=profile)
    except (FacultyProfile.DoesNotExist, FacultyCourseHistory.DoesNotExist):
        return Response({"error": "Course history not found"}, status=404)
    
    if request.method == 'PUT':
        serializer = FacultyCourseHistorySerializer(history, data=request.data)
        if serializer.is_valid():
            updated_history = serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    elif request.method == 'DELETE':
        history.delete()
        return Response({"message": "Course history deleted successfully"})