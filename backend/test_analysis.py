#!/usr/bin/env python3
"""
Test script pour vérifier l'analyse CV end-to-end
"""
import requests
import json
from pathlib import Path

BASE_URL = "http://127.0.0.1:5000"
CANDIDATE_EMAIL = "candidat@test.com"
CANDIDATE_PASSWORD = "Test123!"

def log(msg):
    # Remove unicode chars for PowerShell compatibility
    msg = msg.replace("✓", "[OK]").replace("ERROR", "FAIL")
    print(f"[TEST] {msg}")

def test_flow():
    session = requests.Session()
    
    # 1) Login
    log("1. Logging in as candidate...")
    try:
        resp = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": CANDIDATE_EMAIL, "password": CANDIDATE_PASSWORD}
        )
        resp.raise_for_status()
        data = resp.json()
        token = data.get('data', {}).get('access_token')
        if not token:
            log(f"ERROR: No token in response: {data}")
            return
        log(f"✓ Login OK, token: {token[:30]}...")
        # Set header for all future requests
        session.headers.update({"Authorization": f"Bearer {token}"})
    except Exception as e:
        log(f"ERROR login: {e}")
        return
    
    # 2) Create test CV file
    log("\n2. Creating test CV file...")
    try:
        cv_path = Path("app/static/uploads/cv/test_cv.pdf")
        cv_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Create simple PDF
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        c = canvas.Canvas(str(cv_path), pagesize=letter)
        c.drawString(72, 750, "Mamadou Diallo")
        c.drawString(72, 730, "Email: candidat@test.com")
        c.drawString(72, 710, "Developpeur Full Stack")
        c.drawString(72, 690, "Python, JavaScript, React, Flask, SQL")
        c.drawString(72, 670, "Experience: 3 ans de developpement logiciel")
        c.drawString(72, 650, "Education: Master Informatique")
        c.drawString(72, 630, "Langues: Francais (natif), Anglais (courant)")
        c.save()
        log(f"✓ PDF created: {cv_path}")
    except Exception as e:
        log(f"ERROR creating PDF: {e}")
        return
    
    # 3) Upload CV
    log("\n3. Uploading CV...")
    try:
        with open(cv_path, 'rb') as f:
            files = {'cv': f}
            data = {'analyze': 'true'}
            # Use session directly - it already has Authorization header
            resp = session.post(
                f"{BASE_URL}/api/uploads/cv",
                files=files,
                data=data
            )
        resp.raise_for_status()
        upload_data = resp.json()
        log(f"Upload OK: {upload_data}")
        # Correct path: data.analysis.analysis_id (not 'id')
        analysis_id = upload_data.get('data', {}).get('analysis', {}).get('analysis_id')
        log(f"  Analysis ID: {analysis_id}")
    except Exception as e:
        log(f"ERROR upload: {e}")
        if hasattr(e, 'response'):
            log(f"  Response: {e.response.text}")
        return
    
    # 4) Get analysis details
    if analysis_id:
        log(f"\n4. Fetching analysis {analysis_id}...")
        try:
            resp = session.get(f"{BASE_URL}/api/analysis/cv/{analysis_id}")
            resp.raise_for_status()
            analysis = resp.json()
            log(f"✓ Analysis retrieved:")
            log(f"  Overall score: {analysis.get('data', {}).get('analysis', {}).get('overall_score')}")
            log(f"  AI powered: {analysis.get('data', {}).get('analysis', {}).get('ai')}")
            print(json.dumps(analysis, indent=2))
        except Exception as e:
            log(f"ERROR fetching analysis: {e}")
            if hasattr(e, 'response'):
                log(f"  Response: {e.response.text}")
    
    log("\n✓ Test completed!")

if __name__ == '__main__':
    test_flow()
