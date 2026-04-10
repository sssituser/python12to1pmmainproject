from rest_framework import serializers

from myapp.models import (
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
    CodeSubmission,
    Course,
    CourseTopic,
    CourseEnrollment,
    StudentTopicProgress,
    FacultyProfile,
    FacultyAchievement,
    FacultyResearch,
    FacultyCourseHistory,
    AutomatedExamConfig,
)


class AutomatedExamConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = AutomatedExamConfig
        fields = "__all__"


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
        read_only_fields = ['user']  # Make user field read-only in serializer


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
    random_id = serializers.SerializerMethodField()

    class Meta:
        model = ExamAttempt
        fields = "__all__"

    def get_random_id(self, obj):
        # Automatically use Student ID from profile if available
        if obj.user:
            try:
                profile = StudentProfile.objects.get(user=obj.user)
                if profile.student_id:
                    return str(profile.student_id)
            except StudentProfile.DoesNotExist:
                pass
        return obj.random_id or ""


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
    course_title = serializers.SerializerMethodField()
    enrolled_courses = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = [
            'id', 'user', 'student_id', 'age', 'state', 'phone', 
            'parent_phone', 'college', 'year', 'cgpa', 'tenth_percentage', 
            'twelfth_percentage', 'github', 'linkedin', 'education', 
            'profile_image', 'resume', 'course', 'course_title', 
            'enrolled_courses', 'skills', 'projects'
        ]

    def get_course_title(self, obj):
        return obj.course.title if obj.course else ""

    def get_enrolled_courses(self, obj):
        from myapp.models import CourseEnrollment
        enrollments = CourseEnrollment.objects.filter(user=obj.user).select_related('course')
        titles = list(set([e.course.title for e in enrollments if e.course]))
        # Fallback to profile.course if enrollments are empty
        if not titles and obj.course:
            titles = [obj.course.title]
        return titles

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

        if not request or not request.user.is_authenticated:
            return "Open"

        user = request.user

        application = AppliedJob.objects.filter(user=user, job=obj).first()

        if application:
            if application.status == "accepted":
                return "Selected"
            elif application.status == "rejected":
                return "Rejected"
            else:
                return "Under Process"

        if obj.deadline and obj.deadline < date.today():
            return "Closed"

        return "Open"
from myapp.models import AppliedJob

class AppliedJobSerializer(serializers.ModelSerializer):

    job = serializers.PrimaryKeyRelatedField(queryset=Job.objects.all())
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
    course_title = serializers.CharField(source='course.title', read_only=True)

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
            'course',
            'course_title',
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


# ===============================
# COURSE SYSTEM
# ===============================

class CourseTopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseTopic
        fields = ['id', 'topic_text', 'order']


class StudentTopicProgressSerializer(serializers.ModelSerializer):
    topic = CourseTopicSerializer(read_only=True)

    class Meta:
        model = StudentTopicProgress
        fields = ['id', 'topic', 'is_completed', 'completed_at']


class CourseStudentSerializer(serializers.ModelSerializer):
    """Detailed serializer for students"""
    """Serializer for student view - includes progress and locked status"""
    modules = serializers.SerializerMethodField()
    topics = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'level', 'duration', 'progress', 'locked', 'topics', 'modules', 'custom_videos', 'created_at']

    def get_modules(self, obj):
        return obj.modules if isinstance(obj.modules, list) else []

    def get_topics(self, obj):
        return obj.topics if isinstance(obj.topics, list) else []


class CourseFacultySerializer(serializers.ModelSerializer):
    """Detailed serializer for faculty"""
    """Serializer for faculty view - without progress tracking"""
    modules = serializers.SerializerMethodField()
    topics = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'level', 'duration', 'topics', 'modules', 'custom_videos', 'created_at']

    def get_modules(self, obj):
        return obj.modules if isinstance(obj.modules, list) else []

    def get_topics(self, obj):
        return obj.topics if isinstance(obj.topics, list) else []


class CourseCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating courses"""

    class Meta:
        model = Course
        fields = ['id', 'title', 'level', 'duration', 'locked', 'topics', 'modules', 'custom_videos', 'progress']

    def validate_modules(self, value):
        """Ensure modules is always a list"""
        if value is None:
            return []
        if not isinstance(value, (list, dict)):
            raise serializers.ValidationError("Modules must be a list or dict")
        return value

    def validate_topics(self, value):
        """Ensure topics is always a list"""
        if value is None:
            return []
        if not isinstance(value, list):
            raise serializers.ValidationError("Topics must be a list")
        return value


# ===============================
# FACULTY PROFILE
# ===============================

class FacultyAchievementSerializer(serializers.ModelSerializer):
    """Serializer for faculty achievements"""
    
    class Meta:
        model = FacultyAchievement
        fields = [
            'id', 'title', 'description', 'awarding_organization',
            'date_received', 'certificate', 'created_at'
        ]
        read_only_fields = ['created_at']


class FacultyResearchSerializer(serializers.ModelSerializer):
    """Serializer for faculty research projects and publications"""
    
    class Meta:
        model = FacultyResearch
        fields = [
            'id', 'title', 'description', 'research_type',
            'journal_or_conference', 'publication_date', 'doi',
            'pdf_file', 'collaborators', 'created_at'
        ]
        read_only_fields = ['created_at']


class FacultyCourseHistorySerializer(serializers.ModelSerializer):
    """Serializer for faculty course history"""
    
    course_title = serializers.CharField(source='course.title', read_only=True)
    
    class Meta:
        model = FacultyCourseHistory
        fields = [
            'id', 'course', 'course_title', 'semester', 'year', 'role',
            'student_count', 'average_rating', 'feedback', 'created_at'
        ]
        read_only_fields = ['created_at']


class FacultyProfileSerializer(serializers.ModelSerializer):
    """Main serializer for faculty profile"""
    
    # Temporarily comment out nested serializers to isolate the issue
    # achievements = FacultyAchievementSerializer(many=True, read_only=True)
    # research_projects = FacultyResearchSerializer(many=True, read_only=True)
    # course_history = FacultyCourseHistorySerializer(many=True, read_only=True)
    
    full_name = serializers.ReadOnlyField()
    email = serializers.ReadOnlyField()
    
    class Meta:
        model = FacultyProfile
        fields = [
            'id', 'user', 'first_name', 'last_name', 'phone', 'bio', 'avatar',
            'location', 'join_date', 'languages', 'department', 'designation',
            'experience', 'specialization', 'education', 'certifications',
            'publications', 'research_interests', 'linkedin', 'twitter',
            'github', 'website', 'courses_taught', 'students_mentored',
            'publications_count', 'experience_years', 'created_at', 'updated_at',
            'is_active', 'full_name', 'email'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at', 'courses_taught', 
                           'students_mentored', 'publications_count', 'experience_years']
    
    def validate_avatar(self, value):
        """Validate avatar image size and format"""
        if value:
            # Limit file size to 5MB
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Avatar image size should not exceed 5MB.")
            
            # Validate file format
            allowed_formats = ['JPEG', 'PNG', 'JPG', 'WEBP']
            if value.image.format not in allowed_formats:
                raise serializers.ValidationError(
                    f"Avatar image format must be one of: {', '.join(allowed_formats)}"
                )
        return value
    
    def validate_phone(self, value):
        """Validate phone number format"""
        if value and not value.replace('+', '').replace('-', '').replace(' ', '').isdigit():
            raise serializers.ValidationError("Phone number must contain only digits, +, -, and spaces.")
        return value
    
    def create(self, validated_data):
        """Create faculty profile with nested data"""
        # Extract nested data
        achievements_data = validated_data.pop('achievements_data', [])
        research_data = validated_data.pop('research_data', [])
        course_history_data = validated_data.pop('course_history_data', [])
        
        # Create faculty profile
        profile = FacultyProfile.objects.create(**validated_data)
        
        # Create nested objects
        for achievement_data in achievements_data:
            FacultyAchievement.objects.create(faculty_profile=profile, **achievement_data)
        
        for research_data in research_data:
            FacultyResearch.objects.create(faculty_profile=profile, **research_data)
        
        for history_data in course_history_data:
            FacultyCourseHistory.objects.create(faculty_profile=profile, **history_data)
        
        # Update statistics
        profile.update_stats()
        
        return profile
    
    def update(self, instance, validated_data):
        """Update faculty profile with nested data"""
        # Extract nested data
        achievements_data = validated_data.pop('achievements_data', None)
        research_data = validated_data.pop('research_data', None)
        course_history_data = validated_data.pop('course_history_data', None)
        
        # Update main profile
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update achievements if provided
        if achievements_data is not None:
            instance.achievements.all().delete()
            for achievement_data in achievements_data:
                FacultyAchievement.objects.create(faculty_profile=instance, **achievement_data)
        
        # Update research projects if provided
        if research_data is not None:
            instance.research_projects.all().delete()
            for research_data in research_data:
                FacultyResearch.objects.create(faculty_profile=instance, **research_data)
        
        # Update course history if provided
        if course_history_data is not None:
            instance.course_history.all().delete()
            for history_data in course_history_data:
                FacultyCourseHistory.objects.create(faculty_profile=instance, **history_data)
        
        # Update statistics
        instance.update_stats()
        
        return instance


class FacultyProfilePublicSerializer(serializers.ModelSerializer):
    """Public serializer for faculty profile (limited fields)"""
    
    full_name = serializers.ReadOnlyField()
    department = serializers.ReadOnlyField()
    designation = serializers.ReadOnlyField()
    avatar = serializers.ImageField(read_only=True)
    
    class Meta:
        model = FacultyProfile
        fields = [
            'id', 'full_name', 'department', 'designation', 'avatar',
            'bio', 'specialization', 'research_interests', 'publications_count',
            'courses_taught', 'experience_years'
        ]


class FacultyProfileMinimalSerializer(serializers.ModelSerializer):
    """Minimal serializer for dropdowns and lists"""
    
    full_name = serializers.ReadOnlyField()
    designation = serializers.ReadOnlyField()
    
    class Meta:
        model = FacultyProfile
        fields = ['id', 'full_name', 'designation', 'department']