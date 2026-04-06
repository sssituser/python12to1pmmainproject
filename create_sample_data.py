#!/usr/bin/env python
import os
import sys
import django

# Set up Django environment
sys.path.append(r'd:\SSSIT MAIN PROJECT\python12to1pmmainproject\placement')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

from myapp.models import User, StudentProfile, Job, JobApplication, ExamAttempt
from django.contrib.auth import get_user_model

def create_sample_data():
    print("Creating sample data for testing...")
    
    # Create sample students if they don't exist
    User = get_user_model()
    
    # Create sample faculty user
    faculty_user, created = User.objects.get_or_create(
        username='faculty1',
        defaults={
            'email': 'faculty1@test.com',
            'role': 'faculty',
            'is_active': True,
            'first_name': 'Test',
            'last_name': 'Faculty'
        }
    )
    if created:
        faculty_user.set_password('password123')
        faculty_user.save()
        print(f"Created faculty user: {faculty_user.username}")
    
    # Create sample students
    students_data = [
        {
            'username': 'student1',
            'email': 'student1@test.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'cgpa': 8.5,
            'college': 'Engineering College',
            'phone': '1234567890'
        },
        {
            'username': 'student2', 
            'email': 'student2@test.com',
            'first_name': 'Jane',
            'last_name': 'Smith',
            'cgpa': 7.8,
            'college': 'Science College',
            'phone': '0987654321'
        },
        {
            'username': 'student3',
            'email': 'student3@test.com', 
            'first_name': 'Mike',
            'last_name': 'Johnson',
            'cgpa': 9.2,
            'college': 'Arts College',
            'phone': '1122334455'
        }
    ]
    
    for student_data in students_data:
        student_user, created = User.objects.get_or_create(
            username=student_data['username'],
            defaults={
                'email': student_data['email'],
                'role': 'student',
                'is_active': True,
                'first_name': student_data['first_name'],
                'last_name': student_data['last_name']
            }
        )
        if created:
            student_user.set_password('password123')
            student_user.save()
            print(f"Created student user: {student_user.username}")
            
            # Create student profile
            profile, profile_created = StudentProfile.objects.get_or_create(
                user=student_user,
                defaults={
                    'student_id': 1000 + User.objects.filter(role='student').count(),
                    'cgpa': student_data['cgpa'],
                    'college': student_data['college'],
                    'phone': student_data['phone'],
                    'age': 20
                }
            )
            if profile_created:
                print(f"Created profile for {student_user.username}")
    
    # Create sample jobs
    jobs_data = [
        {'title': 'Software Engineer', 'company': 'Tech Corp', 'location': 'Bangalore'},
        {'title': 'Data Analyst', 'company': 'Data Inc', 'location': 'Mumbai'},
        {'title': 'Web Developer', 'company': 'Web Solutions', 'location': 'Pune'}
    ]
    
    for job_data in jobs_data:
        job, created = Job.objects.get_or_create(
            title=job_data['title'],
            defaults={
                'company': job_data['company'],
                'location': job_data['location'],
                'description': f'Job description for {job_data["title"]}',
                'requirements': 'Requirements for the job',
                'salary_range': '5-10 LPA',
                'job_type': 'Full-time',
                'is_active': True
            }
        )
        if created:
            print(f"Created job: {job.title}")
    
    # Create sample job applications
    students = User.objects.filter(role='student')
    jobs = Job.objects.all()
    
    for i, student in enumerate(students):
        if i < len(jobs):
            job_app, created = JobApplication.objects.get_or_create(
                user_id=student.id,
                job=jobs[i % len(jobs)],
                defaults={
                    'status': 'Placed' if i == 0 else 'Applied' if i == 1 else 'Pending',
                    'applied_at': '2024-01-01'
                }
            )
            if created:
                print(f"Created job application for {student.username}")
    
    # Create sample exam attempts
    for i, student in enumerate(students):
        for j in range(3):  # 3 exams per student
            exam_attempt, created = ExamAttempt.objects.get_or_create(
                user=student,
                exam_title=f'Exam {j+1}',
                defaults={
                    'score': 75 + (i * 5) + (j * 3),  # Varying scores
                    'total_questions': 100,
                    'exam_date': f'2024-0{j+1}-15'
                }
            )
            if created:
                print(f"Created exam attempt for {student.username}")
    
    print("\n=== SAMPLE DATA CREATED ===")
    print(f"Total Users: {User.objects.count()}")
    print(f"Students: {User.objects.filter(role='student').count()}")
    print(f"Faculty: {User.objects.filter(role='faculty').count()}")
    print(f"Student Profiles: {StudentProfile.objects.count()}")
    print(f"Jobs: {Job.objects.count()}")
    print(f"Job Applications: {JobApplication.objects.count()}")
    print(f"Exam Attempts: {ExamAttempt.objects.count()}")

if __name__ == '__main__':
    create_sample_data()
