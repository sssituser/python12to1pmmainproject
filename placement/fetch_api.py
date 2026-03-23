import urllib.request
import json
import traceback

try:
    req = urllib.request.urlopen('http://127.0.0.1:8000/api/weekly-exam-results/')
    data = req.read().decode('utf-8')
    with open('output.json', 'w') as f:
        f.write(data)
    print("Success! Data written to output.json")
except Exception as e:
    with open('output.json', 'w') as f:
        f.write(traceback.format_exc())
    print("Error written to output.json")
