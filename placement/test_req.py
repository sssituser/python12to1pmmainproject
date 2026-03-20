import requests

response = requests.post('http://127.0.0.1:8000/api/save-exam-report/', json={"username":"test_user", "score":10, "total_marks":10})
print("STATUS", response.status_code)
print("TEXT", response.text)

response = requests.get('http://127.0.0.1:8000/api/exam-reports/')
print("GET", response.text)
