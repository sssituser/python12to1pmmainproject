import os
import django
os.environ['DJANGO_SETTINGS_MODULE'] = 'placement.settings'
django.setup()

from myapp.models import ExamAttempt
attempts = ExamAttempt.objects.all().order_by('-id')[:10]
print(f"Total exams: {ExamAttempt.objects.count()}")
for a in attempts:
    uname = a.user.username if a.user else 'NULL'
    print(f"  ID:{a.id}  User:{uname}  Title:{a.exam_title}  Score:{a.marks_obtained}/{a.total_marks}")
