#!/usr/bin/env python3
"""
Debug script to identify the exact cause of 400 error on CV upload
"""
import requests
import json
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

BASE_URL = "http://127.0.0.1:5000"
CANDIDATE_EMAIL = "candidat@test.com"
CANDIDATE_PASSWORD = "Test123!"

print("[DEBUG] Starting CV upload debug test...")

# 1. Login
print("\n[1] Logging in...")
resp = requests.post(
    f"{BASE_URL}/api/auth/login",
    json={"email": CANDIDATE_EMAIL, "password": CANDIDATE_PASSWORD}
)
print(f"    Status: {resp.status_code}")
print(f"    Response: {resp.text[:500]}")

if resp.status_code != 200:
    print("[ERROR] Login failed!")
    exit(1)

data = resp.json()
token = data.get('data', {}).get('access_token')
print(f"    Token: {token[:40] if token else 'NONE'}...")

if not token:
    print("[ERROR] No token in login response!")
    exit(1)

# 2. Create test PDF
print("\n[2] Creating test PDF...")
cv_path = Path("app/static/uploads/cv/test_cv_debug.pdf")
cv_path.parent.mkdir(parents=True, exist_ok=True)

c = canvas.Canvas(str(cv_path), pagesize=letter)
c.drawString(72, 750, "Test CV")
c.drawString(72, 730, "Developer")
c.save()
print(f"    Created: {cv_path}")
print(f"    Size: {cv_path.stat().st_size} bytes")

# 3. Test upload WITHOUT files
print("\n[3] Testing upload with empty body...")
headers = {'Authorization': f'Bearer {token}'}
resp = requests.post(
    f"{BASE_URL}/api/uploads/cv",
    headers=headers
)
print(f"    Status: {resp.status_code}")
print(f"    Response: {resp.text[:300]}")

# 4. Test upload WITH file but no headers
print("\n[4] Testing upload with file (no auth headers)...")
with open(cv_path, 'rb') as f:
    files = {'cv': f}
    resp = requests.post(
        f"{BASE_URL}/api/uploads/cv",
        files=files
    )
print(f"    Status: {resp.status_code}")
print(f"    Response: {resp.text[:300]}")

# 5. Test upload with file AND headers
print("\n[5] Testing upload with file AND auth headers...")
with open(cv_path, 'rb') as f:
    files = {'cv': f}
    resp = requests.post(
        f"{BASE_URL}/api/uploads/cv",
        files=files,
        headers=headers
    )
print(f"    Status: {resp.status_code}")
print(f"    Headers sent: {headers}")
print(f"    Response: {resp.text[:500]}")

if resp.status_code == 400:
    print("\n[ERROR] Still getting 400! Response body:")
    print(resp.text)

print("\n[DONE]")
