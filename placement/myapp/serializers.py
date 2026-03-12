from rest_framework import serializers
<<<<<<< HEAD
from .models import User   # add Exam, ExamAttempt here
from .models import User
from .models import StudentProfile, Skill, Project
=======
from .models import User
>>>>>>> f12bddb0c11812d87e22432dd3c149608efefcc9

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = '__all__'
<<<<<<< HEAD
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
=======

        
>>>>>>> f12bddb0c11812d87e22432dd3c149608efefcc9
# ============jobserializer=====================
from .models import Job,AppliedJob

class JobSerializer(serializers.ModelSerializer):

    class Meta:
        model = Job
        fields = "__all__"
<<<<<<< HEAD
        
class StudentProfileSerializer(serializers.ModelSerializer):
=======
class AppliedJobSerializer(serializers.ModelSerializer):
>>>>>>> f12bddb0c11812d87e22432dd3c149608efefcc9

    class Meta:
<<<<<<< HEAD
        model = StudentProfile
        fields = '__all__'
=======
        model = AppliedJob
        fields = "__all__"

        
>>>>>>> f12bddb0c11812d87e22432dd3c149608efefcc9
