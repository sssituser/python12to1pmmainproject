import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

from myapp.models import PythonQuestion

qs = PythonQuestion.objects.all()
print(f"Total questions: {qs.count()}")
if qs.exists():
    q = qs.first()
    print(f"Example question: {q.question}")
    print(f"Subject: {q.subject}")
    print(f"Category: {q.category}")
