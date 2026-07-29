import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

from myapp.models import StudentProfile, User

students = User.objects.filter(role='student')
print(f"Total students: {students.count()}")
for student in students:
    print(f"\nUser: {student.username} (id={student.id})")
    profiles = StudentProfile.objects.filter(user=student)
    print(f"  Profiles count: {profiles.count()}")
    for p in profiles:
        print(f"  Profile id={p.id}, student_id={p.student_id}")
