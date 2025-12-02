#!/usr/bin/env python
"""Test upload endpoint with detailed debugging"""
import os
import sys
import requests
from pathlib import Path

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

# Wait for server
import time
time.sleep(3)

BASE_URL = 'http://127.0.0.1:5000'

def test_upload():
    """Test CV upload flow"""
    
    # 1. Login
    print("[1] Logging in...")
    login_data = {
        'email': 'candidat@test.com',
        'password': 'Test123!'
    }
    resp = requests.post(f'{BASE_URL}/api/auth/login', json=login_data)
    print(f"  Status: {resp.status_code}")
    if resp.status_code != 200:
        print(f"  ERROR: {resp.text}")
        return
    
    token = resp.json().get('data', {}).get('access_token')
    print(f"  Token: {token[:30] if token else 'NONE'}...")
    
    # 2. Create test PDF
    print("\n[2] Creating test PDF...")
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    
    pdf_path = Path('test_upload.pdf')
    c = canvas.Canvas(str(pdf_path), pagesize=letter)
    c.drawString(72, 750, "Test CV for Upload")
    c.drawString(72, 730, "Python Developer")
    c.drawString(72, 710, "Skills: Python, Flask, SQLAlchemy")
    c.save()
    print(f"  Created: {pdf_path}")
    
    # 3. Upload CV with detailed logging
    print("\n[3] Uploading CV...")
    headers = {
        'Authorization': f'Bearer {token}'
    }
    
    with open(pdf_path, 'rb') as f:
        files = {'cv': f}
        data = {'analyze': 'true'}
        
        print(f"  URL: {BASE_URL}/api/uploads/cv")
        print(f"  Headers: {headers}")
        print(f"  Files: cv={pdf_path.name}")
        print(f"  Data: {data}")
        
        resp = requests.post(
            f'{BASE_URL}/api/uploads/cv',
            files=files,
            data=data,
            headers=headers
        )
        
        print(f"  Status: {resp.status_code}")
        print(f"  Response: {resp.text[:500]}")
        
        if resp.status_code != 201:
            print(f"\n❌ UPLOAD FAILED")
            print(f"Full response:\n{resp.text}")
        else:
            print(f"\n✅ UPLOAD SUCCESS")
            result = resp.json()
            print(f"Analysis ID: {result.get('data', {}).get('analysis', {}).get('analysis_id')}")
    
    # Clean up
    if pdf_path.exists():
        pdf_path.unlink()
        print(f"\nCleaned up: {pdf_path}")

if __name__ == '__main__':
    test_upload()
