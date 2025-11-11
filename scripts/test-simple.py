#!/usr/bin/env python3
"""Simple test to verify stdout is working"""

import sys
import json

result = {
    "success": True,
    "text": "Hello from Python",
    "confidence": 0.95
}

# This MUST go to stdout, not stderr
print(json.dumps(result, ensure_ascii=False), file=sys.stdout)
sys.stdout.flush()
