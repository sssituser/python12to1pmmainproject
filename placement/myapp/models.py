from django.db import models
from django.contrib.auth.models import User
class User(models.Model):
    username = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)

    def __str__(self):
        return self.username
class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # personal information
    student_id = models.IntegerField()
    age = models.IntegerField()
    state = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    # academic details
    college = models.CharField(max_length=200)
    year = models.CharField(max_length=50)
    cgpa = models.FloatField()
    tenth_percentage = models.FloatField()
    twelfth_percentage = models.FloatField()
    # resume upload (for your Resume button)
    resume = models.FileField(upload_to="resumes/", blank=True, null=True)
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

