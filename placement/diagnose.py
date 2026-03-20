import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

from myapp.models import ExamAttempt

attempts = ExamAttempt.objects.all().order_by('-id')[:5]
for a in attempts:
    print(f"ID: {a.id}, Score: {a.score}, Q: {a.questions_json[:50]}..., A: {a.answers_json}")
