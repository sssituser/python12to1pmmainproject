import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

import traceback
from django.test import Client

try:
    c = Client()
    res = c.get('/api/exam-reports/')
    print("GET /api/exam-reports/ status:", res.status_code)
    print("GET /api/exam-reports/ content:", res.content)
    
    # Test POST
    payload = {
        'username': 'testUser',
        'exam_title': 'Daily Exam',
        'score': 10,
        'total_questions': 20,
        'correct_answers': 5,
        'incorrect_answers': 15,
        'marks_obtained': 10,
        'total_marks': 40,
        'time_taken': 300,
        'status': 'completed',
        'random_id': '1234',
        'answers': [],
        'questions': []
    }
    import json
    res = c.post('/api/save-exam-report/', json.dumps(payload), content_type='application/json')
    print("POST /api/save-exam-report/ status:", res.status_code)
    print("POST /api/save-exam-report/ content:", res.content)

except Exception as e:
    print(traceback.format_exc())
