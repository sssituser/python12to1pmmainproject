from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
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

    profile, _ = StudentProfile.objects.get_or_create(user=request.user)
    serializer = StudentProfileSerializer(profile)

    return Response(serializer.data)


# =============================
# UPDATE PROFILE (SMART UPDATE)
# =============================

@api_view(["PUT"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_profile(request):

    profile, _ = StudentProfile.objects.get_or_create(user=request.user)

    skills_data = request.data.get("skills", [])
    projects_data = request.data.get("projects", [])

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

    data = request.data.copy()
    data.pop("skills", None)
    data.pop("projects", None)

    # Parse other JSON string fields
    for key in data:
        if isinstance(data[key], str) and data[key].startswith(('{', '[')):
            try:
                data[key] = json.loads(data[key])
            except:
                pass

    serializer = StudentProfileSerializer(profile, data=data, partial=True)

    if serializer.is_valid():
        serializer.save()

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