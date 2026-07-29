import urllib.request, json, sys

try:
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/all-users/",
        headers={"Authorization": "Bearer dummy_token"}
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read())
    for u in data:
        if u.get("role") == "student":
            print("USER:", u.get("username"), "ID:", u.get("id"))
            print("  student_id field:", u.get("student_id"))
            print("  studentprofile:", u.get("studentprofile"))
except Exception as e:
    print("ERROR:", e)
