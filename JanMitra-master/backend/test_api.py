import requests
import json

try:
    response = requests.get('http://127.0.0.1:8000/schemes?category=Youth&language=en')
    if response.status_code == 200:
        data = response.json()
        print(f"API Success. Received {len(data)} schemes.")
        for s in data:
            print(f"- {s['id']}: {s['name']} (Category: {s['category']}, Age: {s['age_group']})")
    else:
        print(f"API Error: {response.status_code}")
except Exception as e:
    print(f"Connection Error: {e}")
