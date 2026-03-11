from rest_framework import serializers
from .models import User
from .models import StudentProfile, Skill, Project

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'
class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'
class StudentProfileSerializer(serializers.ModelSerializer):

    username = serializers.CharField(source="user.username")
    email = serializers.CharField(source="user.email")
    skills = SkillSerializer(source="skill_set", many=True)
    projects = ProjectSerializer(source="project_set", many=True)
    class Meta:
        model = StudentProfile
        fields = '__all__'