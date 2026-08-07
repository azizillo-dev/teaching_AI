import urllib.request
import urllib.error
import json

req = urllib.request.Request(
    'http://127.0.0.1:8000/api/v1/auth/token',
    data=json.dumps({'email': 'teacher@school.com', 'password': 'wrong'}).encode(),
    headers={'Content-Type': 'application/json'}
)

try:
    urllib.request.urlopen(req)
except urllib.error.HTTPError as e:
    with open('error.html', 'w', encoding='utf-8') as f:
        f.write(e.read().decode('utf-8', errors='replace'))
    print("HTTP Error:", e.code)
