#!/usr/bin/env python3
"""
Pix2Text OCR Script

Advanced math OCR using Pix2Text (free Mathpix alternative)
GitHub: https://github.com/breezedeus/Pix2Text

Usage:
    python3 pix2text_ocr.py <base64_image>

Output: JSON with text, LaTeX, tables, confidence
"""

import sys
import json
import base64
import io
import re
from PIL import Image

try:
    from pix2text import Pix2Text
except ImportError:
    print(json.dumps({
        "success": False,
        "text": "",
        "confidence": 0,
        "error": "Pix2Text not installed. Run: pip install pix2text"
    }))
    sys.exit(1)


def extract_latex(text):
    """Extract LaTeX formulas from text"""
    # Pix2Text marks formulas with $...$ or $$...$$
    latex_patterns = [
        r'\$\$(.*?)\$\$',  # Display math
        r'\$(.*?)\$',      # Inline math
    ]

    latex_formulas = []
    for pattern in latex_patterns:
        matches = re.findall(pattern, text, re.DOTALL)
        latex_formulas.extend(matches)

    return latex_formulas


def extract_tables(text):
    """Extract markdown tables from text"""
    # Pix2Text converts tables to markdown
    table_pattern = r'\|.*?\|.*?\n\|[-:\s|]+\|.*?\n(?:\|.*?\|.*?\n)+'
    tables = re.findall(table_pattern, text, re.DOTALL)
    return tables


def main():
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "text": "",
            "confidence": 0,
            "error": "Usage: python3 pix2text_ocr.py <base64_image>"
        }))
        sys.exit(1)

    base64_image = sys.argv[1]

    try:
        # Remove data URL prefix if present
        if ',' in base64_image:
            base64_image = base64_image.split(',')[1]

        # Decode base64 image
        image_data = base64.b64decode(base64_image)
        image = Image.open(io.BytesIO(image_data))

        # Initialize Pix2Text
        # languages: 'en' for English, 'zh' for Chinese, 'mixed' for both
        p2t = Pix2Text(languages='en')

        # Perform OCR
        # Returns a dictionary with 'text' and optionally 'tables'
        result = p2t.recognize(image, resized_shape=768)

        # Extract text
        if isinstance(result, dict):
            text = result.get('text', '')
        else:
            text = str(result)

        # Extract LaTeX formulas
        latex_formulas = extract_latex(text)
        latex = ' '.join(latex_formulas) if latex_formulas else None

        # Extract tables
        tables = extract_tables(text)

        # Calculate confidence (Pix2Text doesn't provide confidence directly)
        # Estimate based on text length and structure
        confidence = 95 if len(text) > 10 else 80

        # Clean text (remove LaTeX markers for plain text output)
        clean_text = re.sub(r'\$\$?(.*?)\$\$?', r'\1', text)

        # Output JSON result
        output = {
            "success": True,
            "text": clean_text.strip(),
            "latex": latex,
            "tables": tables if tables else None,
            "raw": text,
            "confidence": confidence
        }

        print(json.dumps(output, ensure_ascii=False))

    except Exception as e:
        error_output = {
            "success": False,
            "text": "",
            "confidence": 0,
            "error": f"Pix2Text OCR failed: {str(e)}"
        }
        print(json.dumps(error_output))
        sys.exit(1)


if __name__ == "__main__":
    main()
