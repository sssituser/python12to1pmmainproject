import requests
import json

login = requests.post('http://127.0.0.1:8000/api/login/', json={'username': 'debuguser', 'password': 'test1234'})
print('login', login.status_code, login.text)
if login.status_code != 200:
    raise SystemExit('login failed')

token = login.json().get('access')
print('token present', bool(token))

payload = {'education': json.dumps([{'college': 'SSSIT', 'degree': 'B.Tech', 'year': '2025'}])}
response = requests.put('http://127.0.0.1:8000/api/profile/update/', headers={'Authorization': 'Bearer ' + token}, data=payload)
print('response', response.status_code)
print('response text', response.text)
print('request headers', response.request.headers)
print('request body', response.request.body)
