from django.db import models
from django.contrib.auth.models import User

class User(models.Model):

    username = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)

    def __str__(self):
        return self.username


class LeaveRequest(models.Model):
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=[
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected')
    ], default='Pending')
    approved_by = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.exam.title} - {self.status}"

from django.db import models

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
from django.db import models

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

        return f"{self.name} - {self.start_date} to {self.end_date}"
        return f"Application for {self.job} by user {self.user_id}"
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
    name = models.CharField(max_length=200)
    description = models.TextField()
    template_code = models.TextField()
    language = models.CharField(max_length=50, default='python')
    category = models.CharField(max_length=100, default='general')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.category}"


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

from django.db import models
from django.contrib.auth.models import User


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
    
class Job(models.Model):

    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    description = models.TextField()
    location = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    
class JobApplication(models.Model):

    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    email = models.EmailField()

class AppliedJob(models.Model):

    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    user = models.CharField(max_length=200)