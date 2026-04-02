import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

from myapp.models import ExamAttempt

# Restore the user's manual submissions of 0 marks to Fail
count = ExamAttempt.objects.filter(status='Cheated', score=0, exam_type__in=['weekly', 'monthly']).update(status='Fail')
print('Reverted', count, 'records to Fail')
