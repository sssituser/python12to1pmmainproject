import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

from myapp.models import ExamAttempt

attempts = ExamAttempt.objects.all().order_by('-id')[:20]
results = []
for a in attempts:
    results.append({
        'id': a.id,
        'exam_title': a.exam_title,
        'exam_type': a.exam_type,
        'status': a.status,
        'score': a.score,
        'marks_obtained': a.marks_obtained,
        'exam_date': str(a.exam_date)
    })

with open('db_dump.json', 'w') as f:
    json.dump(results, f, indent=2)
print("Dumped 20 records to db_dump.json")
