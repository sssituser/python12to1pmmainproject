from rest_framework import serializers

from .models import (
    User,
    LeaveRequest,
    Playground,
    PythonQuestion,
    Choice,
    ExamAttempt,
    CodeSnippet,
    CodeTemplate,
    ExecutionSession,
    StudentProfile,
    Skill,
    Project,
    Job,
    AppliedJob,
    Exam,
    MCQQuestion,
    CodingQuestion,
    TestCase,
    MCQAnswer,
    CodeSubmission
)


# ===============================
# USER
# ===============================

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"


# ===============================
# LEAVE REQUEST
# ===============================

class LeaveRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveRequest
        fields = "__all__"


# ===============================
# PYTHON QUESTIONS
# ===============================

class PythonQuestionSerializer(serializers.ModelSerializer):
    choices = serializers.SerializerMethodField()

    class Meta:
        model = PythonQuestion
        fields = "__all__"

    def get_choices(self, obj):
        choices = Choice.objects.filter(question=obj)

        return [
            {
                "id": c.id,
                "text": c.choice_text,
                "is_correct": c.is_correct
            }
            for c in choices
        ]


# ===============================
# EXAM ATTEMPT
# ===============================

class ExamAttemptSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ExamAttempt
        fields = "__all__"


# ===============================
# PLAYGROUND
# ===============================

class CodeSnippetSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodeSnippet
        fields = "__all__"


class CodeTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodeTemplate
        fields = "__all__"


class ExecutionSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExecutionSession
        fields = "__all__"


# ===============================
# PROFILE
# ===============================

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = "__all__"


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = "__all__"


class StudentProfileSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True,read_only=True)
    projects = ProjectSerializer(many=True,read_only=True)

    class Meta:
        model = StudentProfile
        fields = "__all__"

    def update(self, instance, validated_data):
        skills_data = validated_data.pop('skills', [])
        projects_data = validated_data.pop('projects', [])

        # update profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        #  CLEAR OLD SKILLS
        instance.skills.all().delete()

        for skill in skills_data:
            Skill.objects.create(profile=instance, **skill)

        #  CLEAR OLD PROJECTS
        instance.projects.all().delete()

        for project in projects_data:
            Project.objects.create(profile=instance, **project)

        return instance

# ===============================
# JOBS
# ===============================
from datetime import date

class JobSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = "__all__"

    def get_status(self, obj):
        request = self.context.get('request')

        # ❌ if no user → just return Open/Closed
        if not request or not request.user.is_authenticated:
            return "Open"

        user = request.user

        # ✅ Check already applied
        if AppliedJob.objects.filter(user=user, job=obj).exists():
            return "Applied"

        # ✅ Check deadline
        if obj.deadline and obj.deadline < date.today():
            return "Closed"

        return "Open"
from .models import AppliedJob

class AppliedJobSerializer(serializers.ModelSerializer):

    job = JobSerializer()   


    job_details = JobSerializer(source='job', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)


    class Meta:
        model = AppliedJob
        fields = '__all__'
        extra_kwargs = {
            'user': {'read_only': True}
        }


# ===============================
# DAILY EXAM
# ===============================

class TestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = ['id', 'input_data', 'expected_output', 'is_sample']


class MCQQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MCQQuestion
        fields = [
            'id',
            'question_text',
            'option_a',
            'option_b',
            'option_c',
            'option_d',
            'marks',
            'time_limit_seconds'
        ]


class CodingQuestionSerializer(serializers.ModelSerializer):
    test_cases = TestCaseSerializer(many=True, read_only=True)

    class Meta:
        model = CodingQuestion
        fields = [
            'id',
            'title',
            'description',
            'input_format',
            'output_format',
            'constraints',
            'marks',
            'test_cases'
        ]


class ExamSerializer(serializers.ModelSerializer):
    attempt = ExamAttemptSerializer(read_only=True)

    start_time = serializers.TimeField(format="%I:%M %p")
    end_time = serializers.TimeField(format="%I:%M %p")

    mcq_questions = MCQQuestionSerializer(many=True, read_only=True)
    coding_questions = CodingQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Exam
        fields = [
            'id',
            'title',
            'start_date',
            'start_time',
            'end_time',
            'duration_minutes',
            'is_finished',
            'score',
            'total_marks',
            'exam_type',
            'attempt',
            'mcq_questions',
            'coding_questions',
            'created_at',
        ]


# ===============================
# ANSWERS
# ===============================

class MCQAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = MCQAnswer
        fields = "__all__"


class CodeSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodeSubmission
        fields = "__all__"

class PlaygroundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Playground
        fields = '__all__'