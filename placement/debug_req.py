import urllib.request
import json
import urllib.error
import sys

data = json.dumps({
    'exam_title': 'test',
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
    open('test_q5.txt', 'w', encoding='utf-8').write(res.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    open('test_q5.txt', 'w', encoding='utf-8').write(e.read().decode('utf-8'))
except Exception as e:
    open('test_q5.txt', 'w', encoding='utf-8').write(str(e))
