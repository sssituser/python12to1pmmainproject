import urllib.request, json
try:
    req = urllib.request.Request("http://127.0.0.1:8000/api/exam-reports/")
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        if 'data' in data:
            print(f"Total exams from API: {len(data['data'])}")
            if len(data['data']) > 0:
                print(f"First exam username: {data['data'][0].get('user', {}).get('username')}")
except Exception as e:
    print(f"Error: {e}")
