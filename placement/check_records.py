import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

from myapp.models import ExamAttempt

print("ID | Type | Date | Username | Marks | Time")
for a in ExamAttempt.objects.all().order_by('-pk')[:30]:
    try:
        u = a.user.username if a.user else "Unknown"
        print(f"{a.pk} | {a.exam_type} | {a.exam_date.date()} | {u} | {a.marks_obtained} | {a.time_taken}")
    except Exception as e:
        print(f"ERROR on record {a.pk}: {e}")
