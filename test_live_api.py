import requests

try:
    with open(r'C:\Users\akank\Downloads\00001__1_1.svc', 'rb') as f:
        res = requests.post("https://ak332-neurodraw-backend.hf.space/api/analyze-fusion", files={"file": ("00001__1_1.svc", f, "application/octet-stream")})
        print(f"Status: {res.status_code}")
        print(f"Response: {res.text}")
except Exception as e:
    print(f"Error: {e}")
