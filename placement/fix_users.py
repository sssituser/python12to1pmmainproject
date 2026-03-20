import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

from myapp.models import ExamAttempt, User

unknown_attempts = ExamAttempt.objects.filter(user__isnull=True)
if unknown_attempts.exists():
    user, _ = User.objects.get_or_create(username='ranga', defaults={'email': 'ranga@example.com'})
    for attempt in unknown_attempts:
        attempt.user = user
        attempt.save()
    print(f"Fixed {unknown_attempts.count()} attempts")
else:
    print("No null users found.")
