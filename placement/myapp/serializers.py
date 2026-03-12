from rest_framework import serializers
from django.contrib.auth.models import User
from .models import StudentProfile, Skill, Project, Job


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]


class SkillSerializer(serializers.ModelSerializer):

    class Meta:
        model = Skill
        fields = ["id", "name"]


class ProjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Project
        fields = ["id", "title", "description"]


class StudentProfileSerializer(serializers.ModelSerializer):

    user = UserSerializer(read_only=True)
    skills = SkillSerializer(many=True, source="skill_set", read_only=True)
    projects = ProjectSerializer(many=True, source="project_set", read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            "id",
            "user",
            "age",
            "phone",
            "state",
            "resume",
            "skills",
            "projects",
        ]

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = "__all__"