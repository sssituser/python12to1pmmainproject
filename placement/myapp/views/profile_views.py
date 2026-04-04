from rest_framework.decorators import api_view, permission_classes, authentication_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
import json

from ..models import StudentProfile, Skill, Project
from ..serializers import StudentProfileSerializer


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