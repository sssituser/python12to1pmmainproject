import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

from myapp.models import ExamAttempt

print("ID | Type | Date | Marks")
for a in ExamAttempt.objects.all().order_by('-pk')[:10]:
    print(f"{a.pk} | {a.exam_type} | {a.exam_date.date()} | {a.marks_obtained}")
