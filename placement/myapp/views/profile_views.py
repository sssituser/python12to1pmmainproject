from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User

from ..models import StudentProfile, Skill, Project
from ..serializers import StudentProfileSerializer


# =============================
# GET PROFILE
# =============================

@api_view(['GET'])
def profile_view(request):

    if not request.user.is_authenticated:
        return Response({"error": "User not authenticated"}, status=401)

    profile, created = StudentProfile.objects.get_or_create(user=request.user)

    serializer = StudentProfileSerializer(profile)

    return Response(serializer.data)


# =============================
# UPDATE PROFILE
# =============================

@api_view(['PUT'])
def update_profile(request):

    if not request.user.is_authenticated:
        return Response({"error": "User not authenticated"}, status=401)

    profile, created = StudentProfile.objects.get_or_create(user=request.user)

    serializer = StudentProfileSerializer(profile, data=request.data, partial=True)

    if serializer.is_valid():

        serializer.save()

        # Update Skills
        Skill.objects.filter(student=profile).delete()
        skills = request.data.get("skills", [])

        for s in skills:
            Skill.objects.create(student=profile, name=s)

        # Update Projects
        Project.objects.filter(student=profile).delete()
        projects = request.data.get("projects", [])

        for p in projects:
            Project.objects.create(
                student=profile,
                title=p.get("title"),
                description=p.get("description")
            )

        return Response({"message": "Profile updated successfully"})

    return Response(serializer.errors, status=400)


# =============================
# UPLOAD RESUME
# =============================

@api_view(['POST'])
def upload_resume(request):

    if not request.user.is_authenticated:
        return Response({"error": "User not authenticated"}, status=401)

    profile, created = StudentProfile.objects.get_or_create(user=request.user)

    resume = request.FILES.get("resume")

    if not resume:
        return Response({"error": "No resume uploaded"}, status=400)

    profile.resume = resume
    profile.save()

    return Response({"message": "Resume uploaded successfully"})