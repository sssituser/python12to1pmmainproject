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
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)

    skills = SkillSerializer(source="skill_set", many=True, read_only=True)
    projects = ProjectSerializer(source="project_set", many=True, read_only=True)

    class Meta:
        model = StudentProfile
        fields = "__all__"


# ===============================
# JOBS
# ===============================

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = "__all__"


class AppliedJobSerializer(serializers.ModelSerializer):
    job = JobSerializer()   

    class Meta:
        model = AppliedJob
        fields = "__all__"


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