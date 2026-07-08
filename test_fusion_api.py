import requests
from fastapi.testclient import TestClient
from app import app
import json

client = TestClient(app)

with open(r'C:\Users\akank\Downloads\00001__1_1.svc', 'rb') as f:
    response = client.post("/api/analyze-fusion", files={"file": ("00001__1_1.svc", f, "application/octet-stream")})
    print(response.status_code)
    res = response.json()
    print(res.keys())
    if "fusion_result" in res:
        print(json.dumps(res["fusion_result"], indent=2))
    else:
        print(res)
