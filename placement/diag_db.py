import os
import django
from django.utils import timezone
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

from myapp.models import ExamAttempt
from datetime import date

today = date.today()
print(f"Today is: {today}")

count_all = ExamAttempt.objects.count()
count_today = ExamAttempt.objects.filter(exam_date__date=today).count()
count_daily = ExamAttempt.objects.filter(exam_type__iexact='daily').count()
count_both = ExamAttempt.objects.filter(exam_date__date=today, exam_type__iexact='daily').count()

print(f"All: {count_all}")
print(f"Today: {count_today}")
print(f"Daily: {count_daily}")
print(f"Today + Daily: {count_both}")

latest = ExamAttempt.objects.latest('pk') if ExamAttempt.objects.exists() else None
if latest:
    print(f"Latest: pk={latest.pk}, type={latest.exam_type}, date={latest.exam_date.date()}, score={latest.marks_obtained}")
