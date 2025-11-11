/**
 * Pix2Text OCR API Route
 *
 * Advanced math OCR using Pix2Text (free Mathpix alternative)
 * - Accuracy: 95%+ for text, formulas, tables, diagrams
 * - Completely free (no API key required)
 * - Supports LaTeX output for mathematical formulas
 *
 * POST /api/ocr/pix2text
 * Body: { image: string } // base64 encoded image
 *
 * Response: {
 *   success: boolean;
 *   text: string;
 *   latex?: string;
 *   tables?: string[];
 *   raw?: string;
 *   confidence: number;
 *   error?: string;
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds timeout

interface Pix2TextResult {
  success: boolean;
  text: string;
  latex?: string;
  tables?: string[];
  raw?: string;
  confidence: number;
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    console.log('[Pix2Text API] Request received');

    // Parse request body
    const body = await req.json();
    const { image } = body;

    if (!image || typeof image !== 'string') {
      return NextResponse.json({
        success: false,
        text: '',
        confidence: 0,
        error: 'Invalid request: image (base64) required',
      } as Pix2TextResult, { status: 400 });
    }

    // Check if Pix2Text is available
    const scriptPath = path.join(process.cwd(), 'scripts', 'pix2text_ocr.py');
    const venvPython = path.join(process.cwd(), 'venv-ocr', 'bin', 'python3');

    if (!fs.existsSync(scriptPath)) {
      console.error('[Pix2Text API] Script not found:', scriptPath);
      return NextResponse.json({
        success: false,
        text: '',
        confidence: 0,
        error: 'Pix2Text script not found',
      } as Pix2TextResult, { status: 500 });
    }

    if (!fs.existsSync(venvPython)) {
      console.error('[Pix2Text API] Python venv not found:', venvPython);
      return NextResponse.json({
        success: false,
        text: '',
        confidence: 0,
        error: 'Python virtual environment not found',
      } as Pix2TextResult, { status: 500 });
    }

    console.log('[Pix2Text API] Running OCR...');
    console.log(`[Pix2Text API]   - Python: ${venvPython}`);
    console.log(`[Pix2Text API]   - Script: ${scriptPath}`);

    // Run Python script
    const result = await runPix2TextOCR(venvPython, scriptPath, image);

    console.log('[Pix2Text API] OCR completed');
    console.log(`[Pix2Text API]   - Success: ${result.success}`);
    console.log(`[Pix2Text API]   - Text length: ${result.text?.length || 0} chars`);
    console.log(`[Pix2Text API]   - LaTeX: ${result.latex ? 'Yes' : 'No'}`);
    console.log(`[Pix2Text API]   - Tables: ${result.tables?.length || 0}`);

    return NextResponse.json(result, {
      status: result.success ? 200 : 500
    });

  } catch (error: any) {
    console.error('[Pix2Text API] Error:', error);

    return NextResponse.json({
      success: false,
      text: '',
      confidence: 0,
      error: `API error: ${error.message || 'Unknown error'}`,
    } as Pix2TextResult, { status: 500 });
  }
}

/**
 * Run Pix2Text OCR using Python script
 */
function runPix2TextOCR(
  pythonPath: string,
  scriptPath: string,
  imageBase64: string
): Promise<Pix2TextResult> {
  return new Promise((resolve) => {
    try {
      // Spawn Python process
      const python = spawn(pythonPath, [scriptPath, imageBase64]);

      let stdout = '';
      let stderr = '';

      python.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      python.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          console.error('[Pix2Text API] Process failed with code:', code);
          console.error('[Pix2Text API] stderr:', stderr);

          resolve({
            success: false,
            text: '',
            confidence: 0,
            error: `Pix2Text process failed: ${stderr || 'Unknown error'}`,
          });
          return;
        }

        try {
          // Extract JSON from stdout (last line starting with '{')
          const lines = stdout.trim().split('\n').filter(line => line.trim().length > 0);
          const jsonLine = lines.reverse().find(line => line.trim().startsWith('{'));

          if (!jsonLine) {
            console.error('[Pix2Text API] No JSON output found');
            console.error('[Pix2Text API] stdout:', stdout);
            throw new Error('No JSON output found in stdout');
          }

          // Parse JSON result
          const result = JSON.parse(jsonLine) as Pix2TextResult;
          resolve(result);

        } catch (error: any) {
          console.error('[Pix2Text API] Failed to parse JSON:', error);
          console.error('[Pix2Text API] Raw output:', stdout);

          resolve({
            success: false,
            text: '',
            confidence: 0,
            error: `Failed to parse Pix2Text output: ${error.message}`,
          });
        }
      });

      python.on('error', (error) => {
        console.error('[Pix2Text API] Failed to start Python process:', error);

        resolve({
          success: false,
          text: '',
          confidence: 0,
          error: `Failed to start Pix2Text: ${error.message}`,
        });
      });

      // Timeout after 25 seconds (before Next.js 30s limit)
      setTimeout(() => {
        python.kill();
        resolve({
          success: false,
          text: '',
          confidence: 0,
          error: 'Pix2Text OCR timeout (25s)',
        });
      }, 25000);

    } catch (error: any) {
      resolve({
        success: false,
        text: '',
        confidence: 0,
        error: `Unexpected error: ${error.message}`,
      });
    }
  });
}

/**
 * Health check endpoint
 */
export async function GET() {
  const scriptPath = path.join(process.cwd(), 'scripts', 'pix2text_ocr.py');
  const venvPython = path.join(process.cwd(), 'venv-ocr', 'bin', 'python3');

  const available = fs.existsSync(scriptPath) && fs.existsSync(venvPython);

  return NextResponse.json({
    service: 'Pix2Text OCR',
    available,
    python: fs.existsSync(venvPython),
    script: fs.existsSync(scriptPath),
    venvPath: venvPython,
    scriptPath,
  });
}
