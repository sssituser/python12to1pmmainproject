import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

from django.test import Client
c = Client()
response = c.post('/api/save-exam-report/', data={'username':'test','score':20, "correct_answers": 10, "incorrect_answers": 10, "marks_obtained": 20, "total_marks": 40, "time_taken": 10, "status": "completed", "random_id": "1234", "answers": [], "questions": []}, content_type='application/json')
print(response.status_code)
print(response.content.decode())
