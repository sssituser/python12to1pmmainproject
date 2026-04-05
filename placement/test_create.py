import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

from myapp.models import ExamAttempt, User
import traceback

try:
    u = User.objects.first()
    print("User:", u)
    ExamAttempt.objects.create(user=u, exam_title='Test', exam_type='weekly', marks_obtained=10, total_marks=10, correct_answers=5, incorrect_answers=0, total_questions=5, status='completed', time_taken=10)
    print("Success")
except Exception as e:
    print("Error:", e)
    traceback.print_exc()
