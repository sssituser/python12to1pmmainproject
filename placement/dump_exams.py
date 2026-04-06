import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

from myapp.models import ExamAttempt

def dump_attempts():
    attempts = ExamAttempt.objects.all().order_by('-exam_date')
    data = []
    for a in attempts:
        data.append({
            'id': a.id,
            'title': a.exam_title,
            'type': a.exam_type,
            'user': a.user.username,
            'date': str(a.exam_date)
        })
    print(json.dumps(data, indent=2))

if __name__ == '__main__':
    dump_attempts()
