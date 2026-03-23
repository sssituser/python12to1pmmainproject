import os
import django
import sys
import datetime

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "placement.settings")
django.setup()

from myapp.models import ExamAttempt

print("All Attempts:", ExamAttempt.objects.count())
print("Weekly Attempts:", ExamAttempt.objects.filter(exam_type='weekly').count())
print("Monthly Attempts:", ExamAttempt.objects.filter(exam_type='monthly').count())

qs = ExamAttempt.objects.all()
for index, q in enumerate(qs[:10]):
    print(f"[{index}] Type: {q.exam_type}, Date: {q.exam_date}")
