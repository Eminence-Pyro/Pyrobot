"""
Pyrobot — Manual SSE Streaming Verification Script
Proves /chat/stream delivers tokens incrementally (not all at once) by
timestamping each chunk's arrival. Run from backend/ with the venv active:

    python scripts/test_streaming.py
"""
import time
import httpx

BASE_URL = "http://localhost:8000/api/v1"

# Paste a FRESH JWT here — access tokens expire after 15 minutes.
# Get one via the /auth/login curl command from before.
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZDAyOGJmZC1jNzNjLTQ0MjktOWJlNC04YzEzNDc4MTYxYTgiLCJleHAiOjE3ODE5ODgzNjN9.kVc89BBXoEGklYUofwwshcxueNKtDLpIGyCRzt5lAao"

payload = {
    "model": "gemini-2.5-flash",
    "messages": [
        {"role": "user", "content": "Count slowly from 1 to 20, one number per line, with a short sentence about each number."}
    ],
}

start = time.monotonic()

with httpx.stream(
    "POST",
    f"{BASE_URL}/chat/stream",
    headers={"Authorization": f"Bearer {TOKEN}"},
    json=payload,
    timeout=30,
) as response:
    for line in response.iter_lines():
        if not line or not line.startswith("data:"):
            continue
        elapsed = time.monotonic() - start
        chunk = line[len("data:"):].strip()
        print(f"[+{elapsed:6.3f}s] {chunk}")