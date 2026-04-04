import requests
try:
    res = requests.post("http://127.0.0.1:8000/api/login/", json={"username": "VARDHAN", "password": "03-2003"})
    print(f"Status: {res.status_code}")
    print(f"Response: {res.json()}")
except Exception as e:
    print(f"Error: {e}")
