#!/usr/bin/env python3
"""Quick test after fixes"""
import subprocess
import time
import sys
import os

print("[TEST] Starting backend test after import fixes...")

# Use venv python
venv_python = r"C:\Users\ZAKSOFT\Desktop\Bara\.venv\Scripts\python.exe"
backend_dir = r"C:\Users\ZAKSOFT\Desktop\Bara\backend"

# Start server
print("[1] Starting server...")
server_proc = subprocess.Popen(
    [venv_python, "run.py"],
    cwd=backend_dir,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE
)

# Wait for server
time.sleep(7)

# Run test
print("[2] Running analysis test...")
test_result = subprocess.run(
    [venv_python, "test_analysis.py"],
    cwd=backend_dir,
    capture_output=True,
    text=True
)

print(test_result.stdout)
if test_result.returncode != 0:
    print("STDERR:", test_result.stderr)

# Stop server
print("[3] Stopping server...")
server_proc.terminate()
try:
    server_proc.wait(timeout=5)
except subprocess.TimeoutExpired:
    server_proc.kill()
    server_proc.wait()

print("[DONE]")
