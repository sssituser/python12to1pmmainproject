from django.db import models
from django.contrib.auth.models import User


# ===============================
# Student Profile
# ===============================

class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    student_id = models.IntegerField(null=True, blank=True)
    age = models.IntegerField(null=True, blank=True)
    state = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=15, blank=True)
    college = models.CharField(max_length=200, blank=True)
    year = models.CharField(max_length=50, blank=True)
    cgpa = models.FloatField(null=True, blank=True)
    tenth_percentage = models.FloatField(null=True, blank=True)
    twelfth_percentage = models.FloatField(null=True, blank=True)
    github = models.URLField(blank=True)
    linkedin = models.URLField(blank=True)
    resume = models.FileField(upload_to="resumes/", blank=True, null=True)

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


# ===============================
# Jobs
# ===============================

class Job(models.Model):
    company = models.CharField(max_length=200)
    job_title = models.CharField(max_length=200)
    primary_skills = models.TextField()
    deadline = models.DateField()
    location = models.CharField(max_length=200)
    status = models.CharField(max_length=50)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class AppliedJob(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    student_name = models.CharField(max_length=200)
    email = models.EmailField()
    applied_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.student_name


class JobApplication(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    applied_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.user.username} applied for {self.job.title}"


# ===============================
# Leave Requests
# ===============================

class LeaveRequest(models.Model):
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
            ('Medical', 'Medical'),
            ('Personal', 'Personal'),
            ('Academic', 'Academic'),
            ('Family', 'Family'),
            ('Other', 'Other')
        ],
        default='Medical'
    )

    status = models.CharField(max_length=20, default="Pending")
    approved_by = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.status}"


# ===============================
# Python Exam
# ===============================

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
    webcam_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.student_name


class ExamAnswer(models.Model):
    session = models.ForeignKey(ExamSession, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(PythonQuestion, on_delete=models.CASCADE)
    selected_choice = models.ForeignKey(Choice, on_delete=models.CASCADE, null=True, blank=True)
    answer_text = models.TextField(null=True, blank=True)
    time_taken = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)


class WebcamSnapshot(models.Model):
    session = models.ForeignKey(ExamSession, on_delete=models.CASCADE, related_name='snapshots')
    image_path = models.CharField(max_length=500)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_suspicious = models.BooleanField(default=False)
    reason = models.TextField(null=True, blank=True)


class ExamAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    exam_title = models.CharField(max_length=200)

    score = models.IntegerField(default=0)
    total_questions = models.IntegerField(default=20)
    correct_answers = models.IntegerField(default=0)
    incorrect_answers = models.IntegerField(default=0)

    marks_obtained = models.IntegerField(default=0)
    total_marks = models.IntegerField(default=40)

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