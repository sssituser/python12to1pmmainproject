import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()
from django.test import RequestFactory
from myapp.python_views import exam_reports_api

request = RequestFactory().get('/api/all-exam-results/')
response = exam_reports_api(request)
data = response.data['data']

monthly_cheated = [d for d in data if d['examType'] == 'monthly' and d['status'] == 'Cheated']
monthly_failed = [d for d in data if d['examType'] == 'monthly' and d['status'] == 'Fail']
monthly_pass = [d for d in data if d['examType'] == 'monthly' and d['status'] == 'Pass']

print('Dashboard Monthly Cheated count returning:', len(monthly_cheated))
print('Dashboard Monthly Failed count returning:', len(monthly_failed))
print('Dashboard Monthly Pass count returning:', len(monthly_pass))
