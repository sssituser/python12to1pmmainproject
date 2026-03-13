from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User

from ..models import StudentProfile, Skill, Project
from ..serializers import StudentProfileSerializer


@api_view(['GET'])
def Profile_view(request):

    if not request.user.is_authenticated:
        return Response({"error": "User not authenticated"}, status=401)
    profile, created = StudentProfile.objects.get_or_create(user=request.user)
    serializer = StudentProfileSerializer(profile)
    return Response(serializer.data)


@api_view(['PUT'])
def update_profile(request):

    user = User.objects.get(username=request.data.get("username"))
    profile = StudentProfile.objects.get(user=user)
    serializer = StudentProfileSerializer(profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        Skill.objects.filter(student=profile).delete()
        skills = request.data.get("skills", [])
        for s in skills:
            Skill.objects.create(student=profile, name=s)
        Project.objects.filter(student=profile).delete()
        projects = request.data.get("projects", [])
        for p in projects:
            Project.objects.create(
                student=profile,
                title=p.get("title"),
                description=p.get("description")
            )
        return Response({"message": "Profile updated"})
    return Response(serializer.errors)


@api_view(['POST'])
def upload_resume(request):

    if not request.user.is_authenticated:
        return Response({"error": "User not authenticated"}, status=401)
    profile, created = StudentProfile.objects.get_or_create(user=request.user)
    resume = request.FILES.get('resume')
    profile.resume = resume
    profile.save()
    return Response({"message": "Resume uploaded"})