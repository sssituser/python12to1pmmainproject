from rest_framework import serializers
from .models import (
    User, LeaveRequest, PythonQuestion, Choice, ExamAttempt, 
    CodeSnippet, CodeTemplate, ExecutionSession, StudentProfile, 
    Skill, Project, Job, AppliedJob, Playground
)
class PlaygroundSerializer(serializers.ModelSerializer):

    class Meta:
        model = Playground
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class LeaveRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveRequest
        fields = '__all__'

class PythonQuestionSerializer(serializers.ModelSerializer):
    choices = serializers.SerializerMethodField()
    
    class Meta:
        model = PythonQuestion
        fields = '__all__'
    
    def get_choices(self, obj):
        if obj.question_type == 'multiple_choice':
            choices = Choice.objects.filter(question=obj)
            return [
                {
                    'id': choice.id,
                    'text': choice.choice_text,
                    'is_correct': choice.is_correct
                }
                for choice in choices
            ]
        return []

class ExamAttemptSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ExamAttempt
        fields = '__all__'

class CodeSnippetSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodeSnippet
        fields = '__all__'

class CodeTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodeTemplate
        fields = '__all__'

class ExecutionSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExecutionSession
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
    user = UserSerializer(read_only=True)
    skills = SkillSerializer(many=True, source="skill_set", read_only=True)
    projects = ProjectSerializer(many=True, source="project_set", read_only=True)

    class Meta:
        model = StudentProfile
        fields = '__all__'

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'
        
class AppliedJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppliedJob
        fields = '__all__'
