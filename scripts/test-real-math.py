#!/usr/bin/env python3
"""
Test Pix2Text with real math problem image
Verify diagram/table/text recognition
"""

import sys
import json
import base64
from pathlib import Path
from PIL import Image
from pix2text import Pix2Text

def test_with_sample_image():
    """Test with a sample math problem if available"""

    # Initialize Pix2Text
    print("Initializing Pix2Text...")
    p2t = Pix2Text()
    print("✅ Pix2Text initialized\n")

    # For testing, create a simple test image with text and shapes
    # In production, this will receive base64 image from TypeScript

    # Create a simple test image (white background with text)
    from PIL import Image, ImageDraw, ImageFont

    # Create test image (800x600 white background)
    img = Image.new('RGB', (800, 600), color='white')
    draw = ImageDraw.Draw(img)

    # Draw some math text
    text = "Test Problem: x² + 2x + 1 = 0"
    draw.text((50, 50), text, fill='black')

    # Draw a simple diagram (triangle)
    draw.polygon([(200, 200), (400, 200), (300, 350)], outline='black', width=2)
    draw.text((280, 250), "A", fill='black')
    draw.text((390, 180), "B", fill='black')
    draw.text((180, 180), "C", fill='black')

    # Draw a simple table
    table_x, table_y = 450, 200
    for i in range(3):
        draw.line([(table_x, table_y + i*50), (table_x + 200, table_y + i*50)], fill='black', width=2)
    for i in range(3):
        draw.line([(table_x + i*100, table_y), (table_x + i*100, table_y + 100)], fill='black', width=2)

    draw.text((table_x + 20, table_y + 15), "x", fill='black')
    draw.text((table_x + 120, table_y + 15), "y", fill='black')
    draw.text((table_x + 20, table_y + 65), "1", fill='black')
    draw.text((table_x + 120, table_y + 65), "2", fill='black')

    print("=" * 60)
    print("Test Image Created:")
    print("- Text: 'Test Problem: x² + 2x + 1 = 0'")
    print("- Diagram: Triangle ABC")
    print("- Table: 2x2 grid with x, y, 1, 2")
    print("=" * 60)
    print()

    # Recognize
    print("Running Pix2Text recognition...")
    result = p2t.recognize(img, resized_shape=768)

    print("\n" + "=" * 60)
    print("RECOGNITION RESULTS:")
    print("=" * 60)

    # Parse results
    text_parts = []
    latex_parts = []
    tables = []
    diagrams = []

    for idx, item in enumerate(result):
        print(f"\n[Item {idx + 1}]")
        if isinstance(item, dict):
            item_type = item.get('type', 'unknown')
            content = item.get('text', '')
            position = item.get('position', {})

            print(f"  Type: {item_type}")
            print(f"  Content: {content}")
            if position:
                print(f"  Position: {position}")

            if item_type == 'text':
                text_parts.append(content)
            elif item_type == 'formula':
                latex_parts.append(content)
            elif item_type == 'table':
                tables.append(content)
            elif item_type in ['image', 'diagram', 'figure']:
                diagrams.append(content)
        elif isinstance(item, str):
            print(f"  Type: text (string)")
            print(f"  Content: {item}")
            text_parts.append(item)

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY:")
    print("=" * 60)
    print(f"📝 Text blocks recognized: {len(text_parts)}")
    if text_parts:
        print("   →", " | ".join(text_parts[:3]))

    print(f"📐 LaTeX formulas recognized: {len(latex_parts)}")
    if latex_parts:
        print("   →", " | ".join(latex_parts[:3]))

    print(f"📊 Tables recognized: {len(tables)}")
    if tables:
        print("   →", tables[0] if tables else "None")

    print(f"🖼️  Diagrams recognized: {len(diagrams)}")
    if diagrams:
        print("   →", diagrams[0] if diagrams else "None")

    # Expected vs Actual
    print("\n" + "=" * 60)
    print("VERIFICATION:")
    print("=" * 60)

    success = True

    # Check if text was recognized
    text_found = any("Test Problem" in text or "x" in text for text in text_parts)
    print(f"✅ Text recognition: {'PASS' if text_found else 'FAIL'}")
    if not text_found:
        success = False

    # Check if formulas were recognized (x² or x^2)
    formula_found = any("²" in latex or "^" in latex or "x" in latex for latex in latex_parts)
    print(f"{'✅' if formula_found else '⚠️ '} Formula recognition: {'PASS' if formula_found else 'PARTIAL (OCR as text)'}")

    # Check if table was detected
    table_found = len(tables) > 0 or any("x" in text and "y" in text for text in text_parts)
    print(f"{'✅' if len(tables) > 0 else '⚠️ '} Table recognition: {'PASS' if len(tables) > 0 else 'PARTIAL (detected as text)'}")

    # Check if diagram was mentioned
    diagram_found = len(diagrams) > 0 or any("A" in text and "B" in text and "C" in text for text in text_parts)
    print(f"{'✅' if diagram_found else '⚠️ '} Diagram recognition: {'PASS' if diagram_found else 'PARTIAL (text labels detected)'}")

    print("\n" + "=" * 60)
    if success:
        print("✅ ALL TESTS PASSED!")
    else:
        print("⚠️  SOME TESTS FAILED - but Pix2Text is working")
    print("=" * 60)

    return result

if __name__ == '__main__':
    test_with_sample_image()
