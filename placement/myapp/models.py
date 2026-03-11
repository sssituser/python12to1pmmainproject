from django.db import models

class User(models.Model):

    username = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)

    def __str__(self):
        return self.username


class Exam(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exams')
    title = models.CharField(max_length=200)
    start_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    duration_minutes = models.PositiveIntegerField()
    is_finished = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class ExamAttempt(models.Model):
    class AttemptStatus(models.TextChoices):
        ATTEMPTED = 'attempted', 'Attempted'
        UNATTEMPTED = 'unattempted', 'Unattempted'

    exam = models.OneToOneField(Exam, on_delete=models.CASCADE, related_name='attempt')
    status = models.CharField(
        max_length=20,
        choices=AttemptStatus.choices,
        default=AttemptStatus.UNATTEMPTED
    )
    attempted_at = models.DateTimeField(null=True, blank=True)

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


class JobApplication(models.Model):

    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    user_id = models.IntegerField()
    applied_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50)