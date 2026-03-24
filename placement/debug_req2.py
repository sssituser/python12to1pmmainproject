import urllib.request
import json
import urllib.error
import sys

data = json.dumps({
    'username': 'testUser',
    'exam_title': 'test',
    'score': 10,
    'total_questions': 20,
    'correct_answers': 5,
    'incorrect_answers': 15,
    'marks_obtained': 10,
    'total_marks': 40,
    'time_taken': 300,
    'status': 'completed',
    'random_id': '1234',
    'answers': [0, 2, None],
    'questions': [{'question': 'test', 'options': ['1', '2'], 'correct': 0}]
}).encode('utf-8')

req = urllib.request.Request(
    'http://127.0.0.1:8000/api/save-exam-report/',
    data=data,
    headers={'Content-Type': 'application/json'}
)

try:
    res = urllib.request.urlopen(req)
    open('test_q6.txt', 'w', encoding='utf-8').write(res.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    open('test_q6.txt', 'w', encoding='utf-8').write(e.read().decode('utf-8'))
except Exception as e:
    open('test_q6.txt', 'w', encoding='utf-8').write(str(e))
