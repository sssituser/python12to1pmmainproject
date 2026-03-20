import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

from myapp.models import ExamAttempt

count = ExamAttempt.objects.count()
ExamAttempt.objects.all().delete()
remaining = ExamAttempt.objects.count()

print(f"✅ Deleted {count} ExamAttempt records.")
print(f"   Remaining: {remaining}")
