import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

from myapp.models import User, StudentProfile

print('--- USERS ---')
for u in User.objects.all()[:20]:
    print(f'Username: "{u.username}", Email: "{u.email}", Role: "{u.role}"')

print('\n--- STUDENT PROFILES ---')
for p in StudentProfile.objects.all()[:20]:
    print(f'User: "{p.user.username}", StudentID: "{p.student_id}"')
