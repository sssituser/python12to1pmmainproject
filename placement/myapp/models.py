from django.db import models
from django.contrib.auth.models import User


class Playground(models.Model):

    title = models.CharField(max_length=200)
    description = models.TextField()
    code = models.TextField()

    language = models.CharField(max_length=50)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

# Custom User Model
class User(models.Model):
    username = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)

    def __str__(self):
        return self.username

# Leave Request Model


# myapp/models.py
from django.db import models
from django.contrib.auth.models import User

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
# Job Models
class Job(models.Model):
    company = models.CharField(max_length=200)
    job_title = models.CharField(max_length=200)
    primary_skills = models.TextField()
    deadline = models.DateField()
    location = models.CharField(max_length=200)
    status = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.job_title

class AppliedJob(models.Model):
    job = models.ForeignKey("Job", on_delete=models.CASCADE)
    student_name = models.CharField(max_length=200)
    email = models.EmailField()
    applied_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.student_name

class JobApplication(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    user_id = models.IntegerField()
    applied_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50)
    
    def __str__(self):
        return f"Application for {self.job} by user {self.user_id}"

# Exam Models
class PythonQuestion(models.Model):
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=[
        ('multiple_choice', 'Multiple Choice'),
        ('coding', 'Coding'),
        ('short_answer', 'Short Answer')
    ])
    difficulty = models.CharField(max_length=10, choices=[
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard')
    ])
    marks = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Question {self.id} - {self.question_type}"

class Choice(models.Model):
    question = models.ForeignKey(PythonQuestion, on_delete=models.CASCADE, related_name='choices')
    choice_text = models.CharField(max_length=200)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"Choice for {self.question.id}"

class ExamSession(models.Model):
    student_name = models.CharField(max_length=100)
    student_email = models.EmailField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=[
        ('started', 'Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('terminated', 'Terminated')
    ], default='started')
    score = models.IntegerField(null=True, blank=True)
    total_marks = models.IntegerField(null=True, blank=True)
    webcam_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Exam Session - {self.student_name}"

class ExamAnswer(models.Model):
    session = models.ForeignKey(ExamSession, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(PythonQuestion, on_delete=models.CASCADE)
    selected_choice = models.ForeignKey(Choice, on_delete=models.CASCADE, null=True, blank=True)
    answer_text = models.TextField(null=True, blank=True)
    time_taken = models.IntegerField(help_text="Time taken in seconds")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Answer by {self.session.student_name} for Q{self.question.id}"

class WebcamSnapshot(models.Model):
    session = models.ForeignKey(ExamSession, on_delete=models.CASCADE, related_name='snapshots')
    image_path = models.CharField(max_length=500)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_suspicious = models.BooleanField(default=False)
    reason = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Snapshot for {self.session.student_name} at {self.timestamp}"

# Exam Attempt Model (Missing - Added Now)
class ExamAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exam_attempts')
    exam_title = models.CharField(max_length=200)
    score = models.IntegerField(default=0)
    total_questions = models.IntegerField(default=20)
    correct_answers = models.IntegerField(default=0)
    incorrect_answers = models.IntegerField(default=0)
    marks_obtained = models.IntegerField(default=0)  # Total marks (correct_answers * 2)
    total_marks = models.IntegerField(default=40)  # Total possible marks (20 * 2)
    time_taken = models.IntegerField(help_text="Time taken in seconds")
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=[
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('terminated', 'Terminated')
    ], default='completed')
    random_id = models.CharField(max_length=4, blank=True, null=True)  # 4-digit random ID
    exam_date = models.DateTimeField(auto_now_add=True)
    answers_json = models.TextField(null=True, blank=True)  # Store answers as JSON
    questions_json = models.TextField(null=True, blank=True)  # Store questions as JSON

    def __str__(self):
        return f"{self.user.username} - {self.exam_title} - {self.score}/{self.total_marks}"

    class Meta:
        ordering = ['-exam_date']  # Most recent first

# Playground Models
class CodeSnippet(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    code = models.TextField()
    language = models.CharField(max_length=50, default='python')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.language}"

class CodeTemplate(models.Model):
    title = models.CharField(max_length=200)
    language = models.CharField(max_length=50, default='python')
    code = models.TextField()
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.language}"

class ExecutionSession(models.Model):
    session_id = models.CharField(max_length=100, unique=True)
    code = models.TextField()
    language = models.CharField(max_length=50, default='python')
    output = models.TextField(null=True, blank=True)
    error = models.TextField(null=True, blank=True)
    execution_time = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed')
    ], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Session {self.session_id} - {self.status}"

# Profile Models
class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    age = models.IntegerField(null=True, blank=True)
    phone = models.CharField(max_length=15, blank=True)
    state = models.CharField(max_length=100, blank=True)
    resume = models.FileField(upload_to="resumes/", null=True, blank=True)

    def __str__(self):
        return self.user.username

class Skill(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Project(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()

    def __str__(self):
        return self.title
