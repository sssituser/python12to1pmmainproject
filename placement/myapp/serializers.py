from rest_framework import serializers
from django.contrib.auth.models import User
from .models import StudentProfile, Skill, Project, Job
from .models import User   # add Exam, ExamAttempt here
from .models import User
from .models import StudentProfile, Skill, Project
from .models import User


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
class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'
class ProjectSerializer(serializers.ModelSerializer):
    class Meta:

        model = Project
        fields = [
            'id', 'title', 'start_date', 'start_time',
            'end_time', 'duration_minutes', 'is_finished',
            'attempt', 'created_at'
        ]
# ============jobserializer=====================
from .models import Job,AppliedJob

class JobSerializer(serializers.ModelSerializer):

    class Meta:
        model = Job
        fields = "__all__"
        
class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = '__all__'
class AppliedJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppliedJob
        fields = "__all__"

