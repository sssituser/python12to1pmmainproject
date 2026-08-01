from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('faculty', 'Faculty'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student', db_index=True)
    is_verified = models.BooleanField(default=False)
    email_password_encrypted = models.TextField(null=True, blank=True)
    login_session_key = models.CharField(max_length=255, null=True, blank=True)
    class Meta:
        db_table='myapp_user'



# models.py
import random

class OTP(models.Model):
    email = models.EmailField(null=True, blank=True)
    username = models.CharField(max_length=100, null=True, blank=True)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def generate_otp(self, length=6):
        if length == 4:
            self.otp = str(random.randint(1000, 9999))
        else:
            self.otp = str(random.randint(100000, 999999))




# ===============================
# Student Profile
# ===============================

class StudentProfile(models.Model):
    user = models.ForeignKey('myapp.User', on_delete=models.CASCADE)
    student_id = models.IntegerField(null=True, blank=True, db_index=True)
    age = models.IntegerField(null=True, blank=True)
    state = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=15, blank=True)
    parent_phone = models.CharField(max_length=15, blank=True)
    college = models.CharField(max_length=200, blank=True)
    year = models.CharField(max_length=50, blank=True)
    cgpa = models.FloatField(null=True, blank=True)
    tenth_percentage = models.FloatField(null=True, blank=True)
    twelfth_percentage = models.FloatField(null=True, blank=True)
    github = models.URLField(blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    education = models.JSONField(blank=True, null=True, default=list)
    profile_image = models.ImageField(upload_to="profile_images/", blank=True, null=True)
    resume = models.FileField(upload_to="resumes/", blank=True, null=True)
    course = models.ForeignKey('Course', on_delete=models.SET_NULL, null=True, blank=True, related_name='student_profiles')
    approval_status = models.CharField(max_length=20, default='pending', choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')], db_index=True)
    approved_by = models.ForeignKey('myapp.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_students')
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(null=True, blank=True)

    def enrolled_courses_titles(self):
        from myapp.models import CourseEnrollment
        enrollments = CourseEnrollment.objects.filter(user=self.user).select_related('course')
        titles = list(set([e.course.title for e in enrollments if e.course]))
        if not titles and self.course:
            titles = [self.course.title]
        return titles

    def __str__(self):
        return self.user.username


class Skill(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="skills")
    name = models.CharField(max_length=100)
    level = models.IntegerField(default=50)

    def __str__(self):
        return self.name


class Project(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="projects")
    title = models.CharField(max_length=200)
    description = models.TextField()

    def __str__(self):
        return self.title


class AutomatedExamConfig(models.Model):
    exam_name = models.CharField(max_length=255, default="Daily Assessment")
    course_name = models.CharField(max_length=255, unique=True)
    subjects = models.JSONField(default=list)
    duration = models.IntegerField(default=80)
    passing_strategy = models.CharField(max_length=50, default="percentage")
    requirement = models.IntegerField(default=50)
    question_count = models.IntegerField(default=25)
    marks_per_question = models.IntegerField(default=2)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.course_name} - {self.exam_name}"


# ===============================
# Jobs
# ===============================

from django.db import models

class Job(models.Model):

    company = models.CharField(max_length=200)
    job_title = models.CharField(max_length=200)
    primary_skills = models.TextField(blank=True)

    location = models.CharField(max_length=200, blank=True)
    deadline = models.DateField()

    status = models.CharField(max_length=50, default="Open")

    # 🔥 ADD THESE BELOW
    job_type = models.CharField(max_length=50, blank=True)
    experience = models.CharField(max_length=50, blank=True)
    salary = models.CharField(max_length=50, blank=True)
    eligibility = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True, null=True)
    responsibilities = models.TextField(blank=True, null=True)
    external_application_link = models.URLField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.job_title

class AppliedJob(models.Model):
    user = models.ForeignKey('myapp.User', on_delete=models.CASCADE)
    job = models.ForeignKey(Job,on_delete=models.CASCADE)
    applied_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
    max_length=20,
    default='pending',
    choices=[
        ('pending', 'Under Process'),
        ('accepted', 'Selected'),
        ('rejected', 'Rejected')
    ]
)

    def __str__(self):
        return f"{self.user.username} - {self.job.job_title}"


class JobApplication(models.Model):

    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    user_id = models.IntegerField()
    applied_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50)
    def __str__(self):
        return f"Application for {self.job} by user {self.user_id}"


# ===============================
# Leave Requests
# ===============================

class LeaveRequest(models.Model):
    user = models.ForeignKey('myapp.User', on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(blank=True, null=True)
    student_id = models.CharField(max_length=50)
    phone = models.CharField(max_length=15, blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    leave_type = models.CharField(
        max_length=20,
        choices=[
            ('CL', 'Casual Leave'),
            ('SL', 'Sick Leave / Medical Leave'),
            ('EL', 'Earned Leave / Privilege Leave'),
            ('PTO', 'Paid Time Off'),
            ('ML', 'Maternity Leave'),
            ('PL', 'Paternity Leave'),
            ('BL', 'Bereavement Leave'),
            ('CO', 'Compensatory Off'),
            ('PH', 'Public Holidays'),
            ('LWP', 'Loss of Pay / Leave Without Pay'),
            ('WFH', 'Work From Home / Remote Leave'),
            ('SAB', 'Sabbatical Leave'),
            ('MRL', 'Marriage Leave'),
            ('STL', 'Study / Examination Leave'),
        ],
        default='SL'
    )

    status = models.CharField(max_length=20, default="Pending")
    approved_by = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.status}"


class EmailConfiguration(models.Model):
    provider_name = models.CharField(max_length=100, default='Gmail SMTP')
    email_host = models.CharField(max_length=255, default='smtp.gmail.com')
    email_port = models.PositiveIntegerField(default=587)
    email_host_user = models.EmailField()
    email_host_password = models.CharField(max_length=255)
    email_use_tls = models.BooleanField(default=True)
    email_use_ssl = models.BooleanField(default=False)
    default_from_email = models.EmailField(blank=True)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.provider_name} - {self.email_host_user}"


# ===============================
# Admin Notifications
# ===============================

class AdminNotification(models.Model):
    NOTIFICATION_TYPES = [
        ('new_student', 'New Student Registration'),
        ('new_faculty', 'New Faculty Registration'),
        ('system', 'System Alert'),
        ('leave', 'Leave Request'),
    ]

    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES, default='system')
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    related_username = models.CharField(max_length=150, blank=True, null=True)
    related_email = models.EmailField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        db_table = 'myapp_admin_notification'

    def __str__(self):
        return f"[{self.notification_type}] {self.title}"


# ===============================
# Student Job Notifications
# ===============================

class JobNotification(models.Model):
    """
    Created whenever a new job is posted.
    Each student can mark it read independently via their own read receipt.
    A single record per job is sufficient — the frontend fetches unread count
    by comparing against the student's last-seen timestamp stored in localStorage.
    """
    job = models.ForeignKey('Job', on_delete=models.CASCADE, related_name='notifications')
    job_title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True)
    salary = models.CharField(max_length=100, blank=True)
    deadline = models.DateField(null=True, blank=True)
    posted_by = models.CharField(max_length=150, blank=True)  # faculty username
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        db_table = 'myapp_job_notification'

    def __str__(self):
        return f"Job Alert: {self.job_title} @ {self.company}"


# ===============================
# Multi-Subject Exam & Professional Proctoring System
# ===============================

class ExamQuestion(models.Model):
    SUBJECT_CHOICES = [
        ('APTITUDE', 'Quantitative Aptitude'),
        ('REASONING', 'Logical Reasoning'),
        ('ENGLISH', 'Verbal English'),
        ('PYTHON', 'Python Programming'),
        ('JAVA', 'Java Developer'),
        ('SQL', 'SQL Database'),
        ('REACT', 'React JS Development'),
        ('DJANGO', 'Django Backend'),
        ('SPRINGBOOT', 'Spring Boot'),
        ('CLOUD', 'Cloud Computing'),
    ]
    
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]

    subject = models.CharField(max_length=50, choices=SUBJECT_CHOICES, default='PYTHON')
    topic = models.CharField(max_length=100, blank=True, help_text="e.g., Arrays, OOP, Joins, Hooks")
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, default='mcq') # mcq, coding, text
    marks = models.IntegerField(default=2)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.subject} - {self.difficulty}] {self.question_text[:50]}..."

class ExamQuestionChoice(models.Model):
    question = models.ForeignKey(ExamQuestion, on_delete=models.CASCADE, related_name='choices')
    choice_text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.choice_text


class ExamPaper(models.Model):
    title = models.CharField(max_length=200)
    subject = models.CharField(max_length=50, default='PYTHON')
    duration = models.IntegerField(default=60, help_text="Duration in minutes")
    total_marks = models.IntegerField(default=100)
    instructions = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    # Secure rules
    browser_lock_required = models.BooleanField(default=True)
    webcam_proctoring_required = models.BooleanField(default=False)
    max_violations_allowed = models.IntegerField(default=5)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class ExamPaperQuestionRelation(models.Model):
    paper = models.ForeignKey(ExamPaper, on_delete=models.CASCADE, related_name='questions')
    question = models.ForeignKey(ExamQuestion, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)


class PythonQuestion(models.Model):
    question_text = models.TextField()
    question_type = models.CharField(max_length=20)
    difficulty = models.CharField(max_length=10)
    marks = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Question {self.id}"


class Choice(models.Model):
    question = models.ForeignKey(PythonQuestion, on_delete=models.CASCADE, related_name='choices')
    choice_text = models.CharField(max_length=200)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.choice_text


class ExamSession(models.Model):
    student_name = models.CharField(max_length=100)
    student_email = models.EmailField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default='started')
    score = models.IntegerField(null=True, blank=True)
    total_marks = models.IntegerField(null=True, blank=True)
    webcam_enabled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    # Proctoring attributes
    browser_lock_score = models.IntegerField(default=0)
    final_verdict = models.CharField(max_length=50, default='Safe')

    def __str__(self):
        return self.student_name


class ExamAnswer(models.Model):
    session = models.ForeignKey(ExamSession, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(PythonQuestion, on_delete=models.CASCADE)
    selected_choice = models.ForeignKey(Choice, on_delete=models.CASCADE, null=True, blank=True)
    answer_text = models.TextField(null=True, blank=True)
    time_taken = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)





class ExamViolationLog(models.Model):
    VIOLATION_TYPES = [
        ('TAB_SWITCH', 'Tab Switching / Focus Loss'),
        ('FULLSCREEN_EXIT', 'Exited Fullscreen Mode'),
        ('FACE_MISSING', 'No Face Detected'),
        ('MULTIPLE_FACE', 'Multiple Faces Detected'),
        ('PHONE_DETECTED', 'Mobile Phone Detected'),
        ('COPY_ATTEMPT', 'Copy/Paste/Right Click attempt'),
    ]
    
    session = models.ForeignKey(ExamSession, on_delete=models.CASCADE, related_name='violations')
    violation_type = models.CharField(max_length=30, choices=VIOLATION_TYPES)
    timestamp = models.DateTimeField(auto_now_add=True)
    severity_score = models.IntegerField(default=5)
    image_snapshot = models.TextField(blank=True, null=True, help_text="Base64 or url of violation image")
    remarks = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.session.student_name} - {self.violation_type}"


class ExamAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    exam_title = models.CharField(max_length=200)
    exam_type = models.CharField(max_length=50, default='daily')

    score = models.IntegerField(default=0)
    total_questions = models.IntegerField(default=30)
    correct_answers = models.IntegerField(default=0)
    incorrect_answers = models.IntegerField(default=0)

    marks_obtained = models.IntegerField(default=0)
    total_marks = models.IntegerField(default=60)

    time_taken = models.IntegerField()

    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)

    status = models.CharField(max_length=20, default='completed')
    random_id = models.CharField(max_length=4, blank=True, null=True)

    exam_date = models.DateTimeField(auto_now_add=True)

    answers_json = models.TextField(null=True, blank=True)
    questions_json = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ['-exam_date']

    def __str__(self):
        return f"{self.user.username} - {self.exam_title}"


# ===============================
# Playground
# ===============================

class CodeSnippet(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    code = models.TextField()
    language = models.CharField(max_length=50, default='python')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class CodeTemplate(models.Model):
    title = models.CharField(max_length=200)
    language = models.CharField(max_length=50, default='python')
    code = models.TextField()
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class ExecutionSession(models.Model):
    session_id = models.CharField(max_length=100, unique=True)
    code = models.TextField()
    language = models.CharField(max_length=50, default='python')
    output = models.TextField(null=True, blank=True)
    error = models.TextField(null=True, blank=True)
    execution_time = models.FloatField(null=True, blank=True)

    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

class Exam(models.Model):
    EXAM_TYPE_CHOICES = [
        ('mcq', 'MCQ'),
        ('coding', 'Coding'),
        ('both', 'MCQ + Coding'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exams')
    course = models.ForeignKey('Course', on_delete=models.SET_NULL, null=True, blank=True, related_name='exams')
    batch = models.ForeignKey('Batch', on_delete=models.SET_NULL, null=True, blank=True, related_name='exams')
    title = models.CharField(max_length=200)
    start_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    duration_minutes = models.PositiveIntegerField()
    is_finished = models.BooleanField(default=False)
    score = models.PositiveIntegerField(null=True, blank=True)
    total_marks = models.PositiveIntegerField(default=100)
    exam_type = models.CharField(max_length=10, choices=EXAM_TYPE_CHOICES, default='mcq')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    
class MCQQuestion(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='mcq_questions')
    question_text = models.TextField()
    option_a = models.CharField(max_length=300)
    option_b = models.CharField(max_length=300)
    option_c = models.CharField(max_length=300)
    option_d = models.CharField(max_length=300)
    correct_option = models.CharField(max_length=1, choices=[('A','A'),('B','B'),('C','C'),('D','D')])
    marks = models.PositiveIntegerField(default=1)
    time_limit_seconds = models.PositiveIntegerField(default=60)

    def __str__(self):
        return f"{self.exam.title} - Q{self.id}"


class CodingQuestion(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='coding_questions')
    title = models.CharField(max_length=200)
    description = models.TextField()
    input_format = models.TextField(blank=True)
    output_format = models.TextField(blank=True)
    constraints = models.TextField(blank=True)
    marks = models.PositiveIntegerField(default=10)

    def __str__(self):
        return f"{self.exam.title} - {self.title}"
    
class TestCase(models.Model):
    question = models.ForeignKey(CodingQuestion, on_delete=models.CASCADE, related_name='test_cases')
    input_data = models.TextField()
    expected_output = models.TextField()
    is_sample = models.BooleanField(default=False)

    def __str__(self):
        return f"TestCase for {self.question.title}"


class MCQAnswer(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    question = models.ForeignKey(MCQQuestion, on_delete=models.CASCADE)
    selected_option = models.CharField(max_length=1)
    is_correct = models.BooleanField(default=False)
    answered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'question')

class CodeSubmission(models.Model):
    LANGUAGE_CHOICES = [
        ('python', 'Python'), ('java', 'Java'), ('cpp', 'C++'),
    ]
    STATUS_CHOICES = [
        ('accepted', 'Accepted'), ('wrong', 'Wrong Answer'),
        ('error', 'Runtime Error'), ('pending', 'Pending'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    question = models.ForeignKey(CodingQuestion, on_delete=models.CASCADE)
    language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES)
    code = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    passed_cases = models.PositiveIntegerField(default=0)
    total_cases = models.PositiveIntegerField(default=0)
    submitted_at = models.DateTimeField(auto_now_add=True)

class Playground(models.Model):

    title = models.CharField(max_length=200)
    description = models.TextField()
    code = models.TextField()
    language = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.title
    
# OTP merged above

# ===============================
# COURSE SYSTEM
# ===============================
class Course(models.Model):
    LEVEL_CHOICES = [
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
    ]

    title = models.CharField(max_length=200)
    level = models.CharField(max_length=50, choices=LEVEL_CHOICES)
    duration = models.CharField(max_length=50)  # e.g., "3 hrs"
    progress = models.IntegerField(default=0)  # Default progress percentage
    locked = models.BooleanField(default=False)
    topics = models.JSONField(default=list)  # Store topics as JSON array
    modules = models.JSONField(null=True, blank=True, default=list)  # Added for hierarchical subjects/topics
    custom_videos = models.JSONField(default=dict, blank=True)  # Store custom videos
    study_materials = models.JSONField(default=dict, blank=True)  # Store study materials (PDFs, notes)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    


    class Meta:
        ordering = ['created_at']


class CourseTopic(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='topic_records')
    topic_text = models.CharField(max_length=200)
    order = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.course.title} - {self.topic_text}"

    class Meta:
        ordering = ['order']


class CourseEnrollment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    batch = models.ForeignKey('Batch', on_delete=models.SET_NULL, null=True, blank=True, related_name='enrollments')
    is_locked = models.BooleanField(default=False)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, default='Active')
    progress = models.IntegerField(default=0)
    completion_percentage = models.FloatField(default=0.0)
    is_eligible_for_certificate = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.course.title} ({self.batch.name if self.batch else 'No Batch'})"

    class Meta:
        unique_together = ('user', 'course')


# ===============================
# BATCH & MODULE ARCHITECTURE
# ===============================

class Batch(models.Model):
    STATUS_CHOICES = [
        ('Upcoming', 'Upcoming'),
        ('Running', 'Running'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True, db_index=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='batches')
    faculty = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, limit_choices_to={'role': 'faculty'}, related_name='batches')
    timing = models.CharField(max_length=100, blank=True)
    expected_start_date = models.DateField(null=True, blank=True)
    expected_end_date = models.DateField(null=True, blank=True)
    actual_start_date = models.DateField(null=True, blank=True)
    actual_end_date = models.DateField(null=True, blank=True)
    max_students = models.IntegerField(default=30)
    current_students = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Upcoming', db_index=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def compute_status(self):
        from django.utils import timezone
        today = timezone.now().date()
        if self.actual_end_date and today >= self.actual_end_date:
            return 'Completed'
        if self.actual_start_date and today >= self.actual_start_date:
            return 'Running'
        if self.expected_start_date and today >= self.expected_start_date and not self.actual_end_date:
            return 'Running'
        return self.status

    def __str__(self):
        return f"{self.course.title} - {self.name} ({self.code})"


class CourseModule(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='technology_modules')
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.name}"


class FacultyAssignment(models.Model):
    faculty = models.ForeignKey(User, on_delete=models.CASCADE, related_name='faculty_assignments', limit_choices_to={'role': 'faculty'})
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='faculty_assignments')
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='faculty_assignments')
    module = models.ForeignKey(CourseModule, on_delete=models.CASCADE, related_name='faculty_assignments', null=True, blank=True)
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('faculty', 'batch', 'module')

    def __str__(self):
        return f"{self.faculty.username} -> {self.batch.name} ({self.module.name if self.module else 'All Modules'})"


class Attendance(models.Model):
    STATUS_CHOICES = [
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Late', 'Late'),
        ('Excused', 'Excused'),
    ]

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendance_records')
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField(db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Present')
    remarks = models.CharField(max_length=255, blank=True)
    marked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='marked_attendances')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'batch', 'date')

    def __str__(self):
        return f"{self.student.username} - {self.batch.name} - {self.date}: {self.status}"


class LiveClassSession(models.Model):
    STATUS_CHOICES = [
        ('Scheduled', 'Scheduled'),
        ('Live', 'Live'),
        ('Ended', 'Ended'),
        ('Cancelled', 'Cancelled'),
    ]

    title = models.CharField(max_length=200)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='live_classes')
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='live_classes')
    module = models.ForeignKey(CourseModule, on_delete=models.SET_NULL, null=True, blank=True, related_name='live_classes')
    topic = models.CharField(max_length=200, blank=True)
    faculty = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conducted_live_classes')
    meeting_link = models.URLField(max_length=500)
    meeting_id = models.CharField(max_length=100, blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Scheduled')
    recording_url = models.URLField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-start_time']

    def __str__(self):
        return f"{self.title} - {self.batch.name} ({self.status})"


class StudentTopicProgress(models.Model):
    enrollment = models.ForeignKey(CourseEnrollment, on_delete=models.CASCADE, related_name='topic_progress')
    topic = models.ForeignKey(CourseTopic, on_delete=models.CASCADE)
    is_completed = models.BooleanField(default=False)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.enrollment.user.username} - {self.topic.topic_text} - {'Completed' if self.is_completed else 'In Progress'}"

    class Meta:
        unique_together = ('enrollment', 'topic')


# ===============================
# LOGIN EMAIL TRACKING
# ===============================

class LoginEmailLog(models.Model):
    """Track login confirmation emails sent to users for auto-deletion management"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='login_email_logs')
    email_address = models.EmailField()
    email_subject = models.CharField(max_length=255, default='🔐 Login Confirmation - SSSIT Placement Portal')
    email_message_id = models.CharField(max_length=255, blank=True, null=True, help_text="IMAP Message ID for deletion")
    sent_at = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False, help_text="Soft delete flag")
    deleted_at = models.DateTimeField(null=True, blank=True)
    login_time = models.CharField(max_length=50, blank=True)
    user_ip = models.CharField(max_length=50, blank=True)
    browser_info = models.CharField(max_length=255, blank=True)
    
    class Meta:
        ordering = ['-sent_at']
        indexes = [
            models.Index(fields=['email_address', '-sent_at']),
            models.Index(fields=['user', '-sent_at']),
        ]
    
    def save(self, *args, **kwargs):
        """
        DYNAMIC ROLLING CLEANUP: Ensures a strict 30-message limit per email address.
        Triggers automatically on every new log creation.
        """
        super().save(*args, **kwargs)
        
        try:
            # Identify the latest 30 IDs for this specific email
            latest_ids = LoginEmailLog.objects.filter(
                email_address=self.email_address
            ).order_by('-sent_at').values_list('id', flat=True)[:30]
            
            # Efficiently bulk-delete everything older than the top 30
            LoginEmailLog.objects.filter(
                email_address=self.email_address
            ).exclude(id__in=list(latest_ids)).delete()
        except Exception:
            # Failsafe to prevent disruption of login flow
            pass

    def __str__(self):
        return f"Login email to {self.email_address} at {self.sent_at}"
    
    @classmethod
    def get_user_active_login_emails_count(cls, user):
        """Get count of non-deleted login emails for a user"""
        return cls.objects.filter(user=user, is_deleted=False).count()
    
    @classmethod
    def get_user_oldest_active_emails(cls, user, count=30):
        """Get oldest active (non-deleted) login emails for a user"""
        return cls.objects.filter(user=user, is_deleted=False).order_by('sent_at')[:count]
    
    @classmethod
    def get_email_active_count(cls, email_address):
        """Get total count of non-deleted login emails sent to a specific email address (across all users)"""
        return cls.objects.filter(email_address=email_address, is_deleted=False).count()


# ===============================
# Faculty Profile
# ===============================

class FacultyProfile(models.Model):
    user = models.OneToOneField('myapp.User', on_delete=models.CASCADE, related_name='faculty_profile')
    
    # Personal Information
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to="faculty_avatars/", blank=True, null=True)
    location = models.CharField(max_length=200, blank=True)
    join_date = models.DateField(null=True, blank=True)
    languages = models.JSONField(blank=True, null=True, default=list)
    
    # Professional Information
    department = models.CharField(max_length=200, blank=True)
    designation = models.CharField(max_length=200, blank=True)
    experience = models.CharField(max_length=100, blank=True)
    specialization = models.JSONField(blank=True, null=True, default=list)
    education = models.JSONField(blank=True, null=True, default=list)
    certifications = models.JSONField(blank=True, null=True, default=list)
    publications = models.JSONField(blank=True, null=True, default=list)
    research_interests = models.JSONField(blank=True, null=True, default=list)
    
    # Social Links
    linkedin = models.URLField(blank=True, null=True)
    twitter = models.URLField(blank=True, null=True)
    github = models.URLField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    
    # Statistics
    courses_taught = models.IntegerField(default=0)
    students_mentored = models.IntegerField(default=0)
    publications_count = models.IntegerField(default=0)
    experience_years = models.IntegerField(default=0)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'myapp_faculty_profile'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user'], name='myapp_facul_user_id_b78667_idx'),
            models.Index(fields=['department'], name='myapp_facul_departm_f7f7f2_idx'),
            models.Index(fields=['designation'], name='myapp_facul_designa_d374b2_idx'),
            models.Index(fields=['-created_at'], name='myapp_facul_created_f87267_idx'),
        ]

    def __str__(self):
        return f"{self.full_name} - {self.designation}"

    @property
    def full_name(self):
        """Get full name from profile or user"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.user.first_name and self.user.last_name:
            return f"{self.user.first_name} {self.user.last_name}"
        elif self.user.username:
            return self.user.username
        return "Faculty Member"

    @property
    def email(self):
        """Get email from user"""
        return self.user.email if self.user else ""

    def update_stats(self):
        """Update statistics based on related data"""
        try:
            # Update courses taught count (only if relationship exists)
            if hasattr(self, 'course_history') and self.course_history.exists():
                self.courses_taught = self.course_history.count()
            
            # Update publications count (only if relationship exists)
            if hasattr(self, 'research_projects') and self.research_projects.exists():
                self.publications_count = self.research_projects.filter(
                    research_type='publication'
                ).count()
            elif self.publications:
                # Fallback to publications JSON field
                self.publications_count = len(self.publications) if isinstance(self.publications, list) else 0
            
            # Calculate experience years based on join_date
            if self.join_date:
                from datetime import date
                today = date.today()
                years = today.year - self.join_date.year
                if today.month < self.join_date.month or (today.month == self.join_date.month and today.day < self.join_date.day):
                    years -= 1
                self.experience_years = max(0, years)
            
            self.save(update_fields=['courses_taught', 'publications_count', 'experience_years'])
        except Exception as e:
            # Log error but don't fail the entire operation
            print(f"Error updating stats for faculty profile {self.id}: {e}")
            # Save at least the basic fields
            self.save(update_fields=['courses_taught', 'publications_count', 'experience_years'])


class FacultyAchievement(models.Model):
    """Faculty achievements and awards"""
    faculty_profile = models.ForeignKey(FacultyProfile, on_delete=models.CASCADE, related_name='achievements')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    awarding_organization = models.CharField(max_length=200, blank=True)
    date_received = models.DateField(null=True, blank=True)
    certificate = models.FileField(upload_to="faculty_certificates/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} - {self.faculty_profile.full_name}"
    
    class Meta:
        db_table = 'myapp_faculty_achievement'
        ordering = ['-date_received']


class FacultyResearch(models.Model):
    """Faculty research projects and publications"""
    faculty_profile = models.ForeignKey(FacultyProfile, on_delete=models.CASCADE, related_name='research_projects')
    title = models.CharField(max_length=300)
    description = models.TextField()
    research_type = models.CharField(
        max_length=20,
        choices=[
            ('publication', 'Publication'),
            ('project', 'Research Project'),
            ('thesis', 'Thesis'),
            ('presentation', 'Presentation'),
        ],
        default='publication'
    )
    journal_or_conference = models.CharField(max_length=200, blank=True)
    publication_date = models.DateField(null=True, blank=True)
    doi = models.URLField(blank=True, null=True)
    pdf_file = models.FileField(upload_to="faculty_research/", blank=True, null=True)
    collaborators = models.JSONField(blank=True, null=True, default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} - {self.faculty_profile.full_name}"
    
    class Meta:
        db_table = 'myapp_faculty_research'
        ordering = ['-publication_date']


class FacultyCourseHistory(models.Model):
    """Track courses taught by faculty"""
    faculty_profile = models.ForeignKey(FacultyProfile, on_delete=models.CASCADE, related_name='course_history')
    course = models.ForeignKey('Course', on_delete=models.CASCADE)
    semester = models.CharField(max_length=50)
    year = models.IntegerField()
    role = models.CharField(
        max_length=20,
        choices=[
            ('instructor', 'Instructor'),
            ('co_instructor', 'Co-Instructor'),
            ('assistant', 'Teaching Assistant'),
            ('guest', 'Guest Lecturer'),
        ],
        default='instructor'
    )
    student_count = models.IntegerField(default=0)
    average_rating = models.FloatField(null=True, blank=True)
    feedback = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.faculty_profile.full_name} - {self.course.title} ({self.year})"
    
    class Meta:
        db_table = 'myapp_faculty_course_history'
        ordering = ['-year', '-semester']
        unique_together = ['faculty_profile', 'course', 'semester', 'year']


# ===============================
# Academic Task & Portfolio System
# ===============================

class AcademicTask(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    faculty = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'faculty'})
    course = models.ForeignKey('Course', on_delete=models.CASCADE, null=True, blank=True)
    due_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    file_requirement = models.CharField(max_length=100, default="PDF, ZIP, Images, Videos, Source code")

    def __str__(self):
        return self.title

class TaskSubmission(models.Model):
    task = models.ForeignKey(AcademicTask, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'student'})
    file = models.FileField(upload_to='submissions/')
    description = models.TextField(blank=True)
    version = models.IntegerField(default=1)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.student.username} - {self.task.title} (v{self.version})"

class SubmissionEvaluation(models.Model):
    submission = models.OneToOneField(TaskSubmission, on_delete=models.CASCADE, related_name='evaluation')
    faculty = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'faculty'})
    grade = models.CharField(max_length=10)
    score = models.FloatField()
    feedback = models.TextField()
    rubric_scores = models.JSONField(default=dict) # e.g., {"Code Quality": 8, "Documentation": 7}
    evaluated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Evaluation for {self.submission}"

class StudentPortfolio(models.Model):
    student = models.OneToOneField(User, on_delete=models.CASCADE, related_name='portfolio')
    bio = models.TextField(blank=True)
    skills = models.JSONField(default=list)
    ai_generated_summary = models.TextField(blank=True)
    featured_projects = models.ManyToManyField(Project, blank=True)
    is_public = models.BooleanField(default=True)
    portfolio_url = models.SlugField(unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Portfolio of {self.student.username}"


# ===============================
# Unified Placement Exam Engine
# ===============================

class PlacementExam(models.Model):
    EXAM_TYPE_CHOICES = [
        ('daily', 'Daily Exam'),
        ('weekly', 'Weekly Exam'),
        ('monthly', 'Monthly Exam'),
        ('placement', 'Placement Assessment'),
        ('mock', 'Mock Interview Test'),
        ('certification', 'Certification Test'),
    ]

    title = models.CharField(max_length=200)
    exam_type = models.CharField(max_length=20, choices=EXAM_TYPE_CHOICES, default='daily')
    subject = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    duration = models.IntegerField(default=60) # minutes
    total_questions = models.IntegerField(default=30)
    total_marks = models.IntegerField(default=30)
    pass_marks = models.IntegerField(default=15)
    
    # Randomization & Security
    randomize_questions = models.BooleanField(default=True)
    randomize_options = models.BooleanField(default=True)
    negative_marking = models.BooleanField(default=False)
    negative_marks = models.FloatField(default=0.0)

    # Eligibility & Scheduling
    departments = models.JSONField(default=list, help_text="e.g. ['CSE', 'IT']")
    years = models.JSONField(default=list, help_text="e.g. ['2nd Year', '3rd Year']")
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    status = models.CharField(max_length=20, default='scheduled') # scheduled, active, ended
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class PlacementExamSettings(models.Model):
    exam = models.OneToOneField(PlacementExam, on_delete=models.CASCADE, related_name='settings')
    webcam_required = models.BooleanField(default=False)
    fullscreen_required = models.BooleanField(default=True)
    tab_switch_limit = models.IntegerField(default=3)
    face_detection = models.BooleanField(default=True)
    multi_face_detection = models.BooleanField(default=True)
    screenshot_interval = models.IntegerField(default=30) # seconds
    auto_submit = models.BooleanField(default=True)
    risk_threshold = models.IntegerField(default=50)


# ===============================
# Signal Handlers for Course Notifications
# ===============================
# These handlers send emails to enrolled students when faculty adds topics or updates courses

from django.db.models.signals import post_save
from django.dispatch import receiver
from threading import Thread

@receiver(post_save, sender=CourseTopic)
def send_topic_notification_emails(sender, instance, created, **kwargs):
    """
    Signal handler that sends email notifications to all students enrolled in a course
    when a new topic is added by the faculty.
    """
    if not created:
        # Only send emails for newly created topics
        return
    
    def send_emails_async():
        """Send emails asynchronously to avoid blocking the request"""
        try:
            from myapp.email_utils import send_course_update_email
            
            # Get the course
            course = instance.course
            
            # Get all students enrolled in this course
            enrolled_students = CourseEnrollment.objects.filter(
                course=course
            ).select_related('user')
            
            # Send email to each enrolled student
            for enrollment in enrolled_students:
                student = enrollment.user
                try:
                    send_course_update_email(
                        user_email=student.email,
                        username=student.username,
                        course_title=course.title,
                        update_type='topic',
                        update_details={
                            'name': instance.topic_text,
                            'description': f'Topic added to {course.title}'
                        }
                    )
                except Exception as e:
                    print(f"Failed to send email to {student.email}: {e}")
        except Exception as e:
            print(f"Error in send_topic_notification_emails: {e}")
    
    # Send emails in a background thread to avoid blocking
    email_thread = Thread(target=send_emails_async, daemon=True)
    email_thread.start()


from django.db.models.signals import pre_save

@receiver(pre_save, sender=Course)
def capture_old_course_state(sender, instance, **kwargs):
    """
    Capture the old topics and modules lists before saving the course
    to compare and identify newly added subjects/topics in post_save.
    """
    if instance.id:
        try:
            old_instance = Course.objects.get(id=instance.id)
            instance._old_topics = list(old_instance.topics) if old_instance.topics else []
            instance._old_modules = list(old_instance.modules) if old_instance.modules else []
        except Course.DoesNotExist:
            instance._old_topics = []
            instance._old_modules = []
    else:
        instance._old_topics = []
        instance._old_modules = []


@receiver(post_save, sender=Course)
def send_course_update_notification_emails(sender, instance, created, update_fields=None, **kwargs):
    """
    Signal handler that sends email notifications to all students enrolled in a course
    only when newly added topics/modules (subjects) are detected.
    """
    # For new courses, we don't need to send notifications
    if created:
        return
    
    # Retrieve old states captured in pre_save
    old_topics = getattr(instance, '_old_topics', [])
    old_modules = getattr(instance, '_old_modules', [])
    
    new_topics = instance.topics if instance.topics else []
    new_modules = instance.modules if instance.modules else []
    
    # Identify newly added topics
    added_topics = []
    for t in new_topics:
        t_str = t if isinstance(t, str) else t.get('name') if isinstance(t, dict) else str(t)
        if t_str:
            was_present = False
            for old_t in old_topics:
                old_t_str = old_t if isinstance(old_t, str) else old_t.get('name') if isinstance(old_t, dict) else str(old_t)
                if old_t_str == t_str:
                    was_present = True
                    break
            if not was_present:
                added_topics.append(t_str)

    # Identify newly added subjects (modules)
    added_modules = []
    for m in new_modules:
        m_name = m.get('name') or m.get('title') if isinstance(m, dict) else str(m)
        if m_name:
            was_present = False
            for old_m in old_modules:
                old_m_name = old_m.get('name') or old_m.get('title') if isinstance(old_m, dict) else str(old_m)
                if old_m_name == m_name:
                    was_present = True
                    break
            if not was_present:
                added_modules.append(m_name)

    # If nothing was added, do not send any emails
    if not added_topics and not added_modules:
        return
    
    def send_emails_for_course_updates():
        """Send emails asynchronously for course updates"""
        try:
            from myapp.email_utils import send_course_update_email
            
            # Get all students enrolled in this course
            enrolled_students = CourseEnrollment.objects.filter(
                course=instance
            ).select_related('user')
            
            if not enrolled_students.exists():
                return
            
            # Send email to each enrolled student
            for enrollment in enrolled_students:
                student = enrollment.user
                if not student.email:
                    continue
                try:
                    # Notify about newly added topics
                    for topic_name in added_topics:
                        send_course_update_email(
                            user_email=student.email,
                            username=student.username,
                            course_title=instance.title,
                            update_type='topic',
                            update_details={
                                'name': topic_name,
                                'description': f'New topic added to {instance.title}'
                            }
                        )
                    
                    # Notify about newly added modules/subjects
                    for module_name in added_modules:
                        send_course_update_email(
                            user_email=student.email,
                            username=student.username,
                            course_title=instance.title,
                            update_type='subject',
                            update_details={
                                'name': module_name,
                                'description': f'New subject/module added to {instance.title}'
                            }
                        )
                except Exception as e:
                    print(f"Failed to send email to {student.email}: {e}")
        except Exception as e:
            print(f"Error in send_course_update_notification_emails: {e}")
    
    # Send emails in a background thread to avoid blocking
    email_thread = Thread(target=send_emails_for_course_updates, daemon=True)
    email_thread.start()


class ResumeAnalysis(models.Model):
    student = models.OneToOneField(StudentProfile, on_delete=models.CASCADE, related_name='resume_analysis')
    raw_text = models.TextField(blank=True, null=True)
    technical_skills = models.JSONField(default=list, blank=True)
    soft_skills = models.JSONField(default=list, blank=True)
    education = models.JSONField(default=list, blank=True)
    projects = models.JSONField(default=list, blank=True)
    certifications = models.JSONField(default=list, blank=True)
    ats_score = models.IntegerField(default=0)
    improvements = models.JSONField(default=list, blank=True)
    analyzed_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Resume Analysis - {self.student.user.username}"


class BatchResource(models.Model):
    RESOURCE_TYPES = [
        ('video', 'Video Lecture'),
        ('material', 'Study Material / PDF'),
        ('notes', 'Class Notes'),
    ]
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=200)
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPES, default='material')
    file_url = models.TextField(blank=True, null=True, help_text="Link or base64 data URL for PDF / Material")
    video_url = models.TextField(blank=True, null=True, help_text="Link or base64 data URL for recorded lecture")
    is_active = models.BooleanField(default=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.resource_type.upper()}] {self.title} - {self.batch.name}"


class Assignment(models.Model):
    batch = models.ForeignKey('Batch', on_delete=models.CASCADE, related_name='assignments')
    faculty = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'faculty'}, related_name='created_assignments')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file_url = models.URLField(max_length=500, blank=True, null=True)
    due_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.batch.name}"


class AssignmentSubmission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'student'}, related_name='assignment_submissions')
    submitted_file_url = models.URLField(max_length=500)
    submitted_at = models.DateTimeField(auto_now_add=True)
    grade = models.CharField(max_length=10, blank=True, null=True)
    feedback = models.TextField(blank=True, null=True)
    evaluated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='evaluated_submissions')

    def __str__(self):
        return f"{self.student.username} - {self.assignment.title}"


# ===============================
# Student Approval & CRUD Audit Log
# ===============================
class StudentAuditLog(models.Model):
    ACTION_CHOICES = (
        ('registration', 'Registration'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('created', 'Account Created'),
        ('updated', 'Profile Updated'),
        ('course_assigned', 'Course Assigned'),
        ('status_toggled', 'Status Toggled'),
        ('deleted', 'Account Deleted'),
    )
    user_id = models.IntegerField(null=True, blank=True)
    student_name = models.CharField(max_length=255)
    student_email = models.CharField(max_length=255, blank=True, null=True)
    student_id_val = models.CharField(max_length=100, blank=True, null=True)
    action_type = models.CharField(max_length=50, choices=ACTION_CHOICES, default='updated')
    action_title = models.CharField(max_length=255)
    performed_by = models.CharField(max_length=255, default='System')
    details = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'myapp_student_audit_log'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student_name} - {self.action_title} ({self.created_at})"




    


