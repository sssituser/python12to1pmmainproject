import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

from myapp.models import ExamAttempt

with open('db_out.txt', 'w') as f:
    f.write("ID | Type | Date | Username | Marks | Time\n")
    for a in ExamAttempt.objects.all().order_by('-pk')[:50]:
        try:
            u = a.user.username if (a.user and hasattr(a.user, 'username')) else "Unknown"
            f.write(f"{a.pk} | {a.exam_type} | {a.exam_date.date()} | {u} | {a.marks_obtained} | {a.time_taken}\n")
        except Exception as e:
            f.write(f"ERROR on record {a.pk}: {e}\n")
