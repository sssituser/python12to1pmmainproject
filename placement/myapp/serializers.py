from rest_framework import serializers
from .models import (
    User, Exam, ExamAttempt,
    MCQQuestion, CodingQuestion, TestCase,
    MCQAnswer, CodeSubmission,
    StudentProfile, Skill, Project, Job
)


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


class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'


class StudentProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username")
    email    = serializers.CharField(source="user.email")
    skills   = SkillSerializer(source="skill_set", many=True)
    projects = ProjectSerializer(source="project_set", many=True)

    class Meta:
        model  = StudentProfile
        fields = '__all__'


class ExamAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ExamAttempt
        fields = ['id', 'status', 'attempted_at']


class TestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model  = TestCase
        fields = ['id', 'input_data', 'expected_output', 'is_sample']


class MCQQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = MCQQuestion
        fields = ['id', 'question_text', 'option_a', 'option_b',
                  'option_c', 'option_d', 'marks', 'time_limit_seconds']


class CodingQuestionSerializer(serializers.ModelSerializer):
    test_cases = TestCaseSerializer(many=True, read_only=True)

    class Meta:
        model  = CodingQuestion
        fields = ['id', 'title', 'description', 'input_format',
                  'output_format', 'constraints', 'marks', 'test_cases']


class ExamSerializer(serializers.ModelSerializer):
    attempt          = ExamAttemptSerializer(read_only=True)
    start_time       = serializers.TimeField(format="%I:%M %p")
    end_time         = serializers.TimeField(format="%I:%M %p")
    mcq_questions    = MCQQuestionSerializer(many=True, read_only=True)
    coding_questions = CodingQuestionSerializer(many=True, read_only=True)

    class Meta:
        model  = Exam
        fields = [
            'id', 'title', 'start_date', 'start_time', 'end_time',
            'duration_minutes', 'is_finished', 'score', 'total_marks',
            'exam_type', 'attempt', 'mcq_questions', 'coding_questions',
            'created_at',
        ]


class MCQAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model  = MCQAnswer
        fields = '__all__'


class CodeSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = CodeSubmission
        fields = '__all__'