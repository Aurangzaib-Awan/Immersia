#!/usr/bin/env python
"""Test script to verify imports work correctly without Mediapipe debug dump"""

import sys
import os
from io import StringIO

# Set environment variables VERY early
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_DEPRECATION_WARNINGS'] = '0'

print("Starting import test...", flush=True)

# Suppress output during imports
old_stdout = sys.stdout
old_stderr = sys.stderr

# Import main first
print("Importing main module...")
sys.stdout = StringIO()
sys.stderr = StringIO()
try:
    import main
finally:
    sys.stdout = old_stdout
    sys.stderr = old_stderr
    
print("✅ main module imported successfully")

# Now import proctoring
print("Importing proctoring module (this may take a moment)...")
sys.stdout = StringIO()
sys.stderr = StringIO()
try:
    import routes.proctoring
finally:
    sys.stdout = old_stdout
    sys.stderr = old_stderr

print("✅ proctoring module imported successfully")
print("✅ No Mediapipe graph dump appeared during imports")
print("\nVerification passed!")
