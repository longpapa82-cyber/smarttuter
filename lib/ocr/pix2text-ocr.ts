/**
 * Pix2Text OCR
 *
 * Advanced math OCR using Pix2Text (free Mathpix alternative)
 * Accuracy: 95%+ (text, formulas, tables, diagrams)
 *
 * Features:
 * - Mathematical formula recognition (LaTeX output)
 * - Table extraction and structure recognition
 * - Layout analysis
 * - 80+ languages support
 *
 * GitHub: https://github.com/breezedeus/Pix2Text
 *
 * Note: This module has both client-side and server-side implementations.
 * - Client: Calls API route /api/ocr/pix2text
 * - Server: Uses child_process to call Python script directly
 */

// Detect if we're running on the server or client
const isServer = typeof window === 'undefined';

export interface Pix2TextResult {
  success: boolean;
  text: string;
  latex?: string;
  tables?: string[];
  raw?: string;  // Original Pix2Text result with LaTeX embedded
  confidence: number;
  error?: string;
}

/**
 * Perform OCR on image using Pix2Text
 *
 * @param imageBase64 - Base64 encoded image (with or without data URL prefix)
 * @returns OCR result with text, LaTeX formulas, and tables
 */
export async function pix2textOCR(imageBase64: string): Promise<Pix2TextResult> {
  // Client-side: Call API route
  if (!isServer) {
    return pix2textOCRClient(imageBase64);
  }

  // Server-side: Use child_process directly
  return pix2textOCRServer(imageBase64);
}

/**
 * Client-side implementation: Call API route
 */
async function pix2textOCRClient(imageBase64: string): Promise<Pix2TextResult> {
  try {
    console.log('[Pix2Text Client] Calling API route...');

    const response = await fetch('/api/ocr/pix2text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageBase64 }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json() as Pix2TextResult;

    console.log('[Pix2Text Client] ✅ Success!');
    return result;

  } catch (error: any) {
    console.error('[Pix2Text Client] Error:', error);
    return {
      success: false,
      text: '',
      confidence: 0,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Server-side implementation: Use Python script directly
 */
async function pix2textOCRServer(imageBase64: string): Promise<Pix2TextResult> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('[Pix2Text OCR] Starting advanced OCR...');

      // Dynamic import (server-only modules)
      const { spawn } = await import('child_process');
      const path = await import('path');

      // Path to Python script and virtual environment
      const scriptPath = path.join(process.cwd(), 'scripts', 'pix2text_ocr.py');
      const venvPython = path.join(process.cwd(), 'venv-ocr', 'bin', 'python3');

      // Check if running in development or production
      const pythonPath = venvPython;

      console.log(`[Pix2Text OCR] Using Python: ${pythonPath}`);
      console.log(`[Pix2Text OCR] Script: ${scriptPath}`);

      // Spawn Python process
      const python = spawn(pythonPath, [scriptPath, imageBase64]);

      let stdout = '';
      let stderr = '';

      python.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      python.stderr.on('data', (data) => {
        stderr += data.toString();
        console.error('[Pix2Text OCR] Python stderr:', data.toString());
      });

      python.on('close', (code) => {
        if (code !== 0) {
          console.error('[Pix2Text OCR] Process exited with code:', code);
          console.error('[Pix2Text OCR] stderr:', stderr);

          resolve({
            success: false,
            text: '',
            confidence: 0,
            error: `Pix2Text process failed: ${stderr || 'Unknown error'}`,
          });
          return;
        }

        try {
          // Pix2Text may output debug messages to stdout before JSON
          // Extract only the JSON line (last non-empty line starting with '{')
          const lines = stdout.trim().split('\n').filter(line => line.trim().length > 0);
          const jsonLine = lines.reverse().find(line => line.trim().startsWith('{'));

          if (!jsonLine) {
            throw new Error('No JSON output found in stdout');
          }

          // Parse JSON output
          const result = JSON.parse(jsonLine) as Pix2TextResult;

          console.log('[Pix2Text OCR] ✅ Success!');
          console.log(`[Pix2Text OCR] Text length: ${result.text?.length || 0} chars`);
          console.log(`[Pix2Text OCR] LaTeX formulas: ${result.latex ? 'Yes' : 'No'}`);
          console.log(`[Pix2Text OCR] Tables found: ${result.tables?.length || 0}`);

          resolve(result);
        } catch (error) {
          console.error('[Pix2Text OCR] Failed to parse JSON:', error);
          console.error('[Pix2Text OCR] Raw output:', stdout);

          resolve({
            success: false,
            text: '',
            confidence: 0,
            error: `Failed to parse Pix2Text output: ${error}`,
          });
        }
      });

      python.on('error', (error) => {
        console.error('[Pix2Text OCR] Failed to start Python process:', error);

        resolve({
          success: false,
          text: '',
          confidence: 0,
          error: `Failed to start Pix2Text: ${error.message}`,
        });
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        python.kill();
        resolve({
          success: false,
          text: '',
          confidence: 0,
          error: 'Pix2Text OCR timeout (30s)',
        });
      }, 30000);

    } catch (error: any) {
      console.error('[Pix2Text OCR] Error:', error);
      resolve({
        success: false,
        text: '',
        confidence: 0,
        error: error.message || 'Unknown error',
      });
    }
  });
}

/**
 * Check if Pix2Text is available
 */
export function isPix2TextAvailable(): boolean {
  // Client-side: Always assume available (API will handle it)
  if (!isServer) {
    return true;
  }

  // Server-side: Check if Python virtual environment exists
  try {
    const path = require('path');
    const fs = require('fs');

    const venvPath = path.join(process.cwd(), 'venv-ocr');
    const scriptPath = path.join(process.cwd(), 'scripts', 'pix2text_ocr.py');

    const venvExists = fs.existsSync(venvPath);
    const scriptExists = fs.existsSync(scriptPath);

    const available = venvExists && scriptExists;

    console.log(`[Pix2Text] Availability check: ${available ? '✅ Available' : '❌ Not available'}`);
    console.log(`[Pix2Text]   - venv: ${venvExists ? '✅' : '❌'} (${venvPath})`);
    console.log(`[Pix2Text]   - script: ${scriptExists ? '✅' : '❌'} (${scriptPath})`);

    return available;
  } catch (error) {
    console.error('[Pix2Text] Availability check failed:', error);
    return false;
  }
}

/**
 * Get Pix2Text version info
 */
export async function getPix2TextVersion(): Promise<string> {
  // Client-side: Not available
  if (!isServer) {
    return 'client-side';
  }

  // Server-side: Check version
  return new Promise(async (resolve) => {
    try {
      const { spawn } = await import('child_process');
      const path = await import('path');

      const venvPython = path.join(process.cwd(), 'venv-ocr', 'bin', 'python3');
      const python = spawn(venvPython, ['-c', 'import pix2text; print(pix2text.__version__)']);

      let output = '';
      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.on('close', () => {
        resolve(output.trim() || 'unknown');
      });

      setTimeout(() => {
        python.kill();
        resolve('timeout');
      }, 5000);
    } catch (error) {
      resolve('error');
    }
  });
}
