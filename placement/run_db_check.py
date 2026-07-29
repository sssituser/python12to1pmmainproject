import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

from myapp.models import StudentProfile, User

users = User.objects.filter(role='student')
print(f"Total student users: {users.count()}")
for u in users:
    profiles = list(StudentProfile.objects.filter(user=u))
    print(f"User ID {u.id} | username: '{u.username}' | first: '{u.first_name}' | last: '{u.last_name}'")
    print(f"  Profiles count: {len(profiles)}")
    for p in profiles:
        print(f"    Profile ID {p.id} -> student_id: {p.student_id}")
