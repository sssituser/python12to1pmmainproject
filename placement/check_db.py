import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

from myapp.models import ExamAttempt
print(f"Total attempts: {ExamAttempt.objects.count()}")
print("Exam Types and Counts:")
for at in ExamAttempt.objects.values('exam_type').distinct():
    count = ExamAttempt.objects.filter(exam_type=at['exam_type']).count()
    print(f"- {at['exam_type']}: {count}")
