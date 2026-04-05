#!/usr/bin/env python
import requests
import json

# Test the faculty profile API endpoints
base_url = "http://127.0.0.1:8000"

# Test endpoints
endpoints = [
    "/api/test-faculty-minimal/",
    "/api/test-faculty-profile/",
]

print("Testing faculty profile API endpoints...")
print("=" * 50)

for endpoint in endpoints:
    url = base_url + endpoint
    try:
        print(f"\nTesting: {endpoint}")
        response = requests.get(url, timeout=5)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        else:
            print(f"Error: {response.text}")
    except requests.exceptions.ConnectionError:
        print("❌ Connection refused - server may not be running")
    except requests.exceptions.Timeout:
        print("❌ Request timeout")
    except Exception as e:
        print(f"❌ Error: {e}")

print("\n" + "=" * 50)
print("API testing complete!")
