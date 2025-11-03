/**
 * Graph Parser
 *
 * Detects and extracts graph information from AI responses
 */

export type GraphType = 'quadratic' | 'linear' | 'circle' | 'trigonometric' | 'exponential' | 'polynomial';

export interface GraphInfo {
  type: GraphType;
  equation: string;
  description?: string;
  parameters?: Record<string, number>;
}

/**
 * Check if message contains graph-related content
 */
export function hasGraphContent(content: string): boolean {
  const graphKeywords = [
    '그래프',
    'graph',
    '함수',
    'function',
    '이차',
    'quadratic',
    '일차',
    'linear',
    '원',
    'circle',
    '삼각함수',
    'trigonometric',
    'sin',
    'cos',
    'tan',
    '지수',
    'exponential',
    'e^',
  ];

  const contentLower = content.toLowerCase();
  return graphKeywords.some(keyword => contentLower.includes(keyword.toLowerCase()));
}

/**
 * Detect graph type from equation or description
 */
export function detectGraphType(equation: string): GraphType {
  const eq = equation.toLowerCase().replace(/\s/g, '');

  // Exponential: e^x, exp(x)
  if (eq.includes('e^') || eq.includes('exp(')) {
    return 'exponential';
  }

  // Trigonometric: sin, cos, tan
  if (eq.includes('sin') || eq.includes('cos') || eq.includes('tan')) {
    return 'trigonometric';
  }

  // Circle: x² + y² = r² or (x-h)² + (y-k)² = r²
  if (
    (eq.includes('x²') || eq.includes('x^2')) &&
    (eq.includes('y²') || eq.includes('y^2')) &&
    !eq.includes('x³') &&
    !eq.includes('x^3')
  ) {
    return 'circle';
  }

  // Quadratic: ax² + bx + c
  if (eq.includes('x²') || eq.includes('x^2')) {
    return 'quadratic';
  }

  // Linear: mx + b or y = ax + b
  if ((eq.includes('x') && !eq.includes('x²') && !eq.includes('x^2') && !eq.includes('x^3')) ||
      eq.match(/y\s*=\s*[+-]?\d*\.?\d*x/)) {
    return 'linear';
  }

  // Default to quadratic for visualization
  return 'quadratic';
}

/**
 * Extract graph information from AI response
 */
export function parseGraphInfo(content: string): GraphInfo | null {
  if (!hasGraphContent(content)) {
    return null;
  }

  // Try to extract equation using various patterns
  const equationPatterns = [
    // y = ...
    /y\s*=\s*([^,\n]+)/gi,
    // f(x) = ...
    /f\(x\)\s*=\s*([^,\n]+)/gi,
    // Standard circle equation
    /\(x\s*[-+]\s*\d+\.?\d*\)\s*²\s*\+\s*\(y\s*[-+]\s*\d+\.?\d*\)\s*²\s*=\s*\d+\.?\d*/gi,
  ];

  let equation = '';
  for (const pattern of equationPatterns) {
    const match = pattern.exec(content);
    if (match) {
      equation = match[0];
      break;
    }
  }

  if (!equation) {
    // No explicit equation found, check for implicit description
    if (content.includes('이차함수') || content.includes('quadratic')) {
      equation = 'y = x²';
    } else if (content.includes('일차함수') || content.includes('linear')) {
      equation = 'y = x';
    } else if (content.includes('원') && (content.includes('circle') || content.includes('반지름'))) {
      equation = 'x² + y² = 4';
    } else if (content.includes('삼각함수') || content.includes('sin')) {
      equation = 'y = sin(x)';
    } else if (content.includes('지수함수') || content.includes('exponential')) {
      equation = 'y = e^x';
    } else {
      return null;
    }
  }

  const type = detectGraphType(equation);

  return {
    type,
    equation: equation.trim(),
    description: extractDescription(content, equation),
    parameters: extractParameters(equation, type),
  };
}

/**
 * Extract description from content
 */
function extractDescription(content: string, equation: string): string | undefined {
  // Find sentence containing the equation
  const sentences = content.split(/[.!?]\s+/);
  for (const sentence of sentences) {
    if (sentence.includes(equation) || sentence.includes('그래프') || sentence.includes('graph')) {
      return sentence.trim();
    }
  }
  return undefined;
}

/**
 * Extract parameters from equation based on type
 */
function extractParameters(equation: string, type: GraphType): Record<string, number> | undefined {
  const params: Record<string, number> = {};

  try {
    switch (type) {
      case 'linear': {
        // y = mx + b
        const match = equation.match(/y\s*=\s*([+-]?\d*\.?\d*)\s*x\s*([+-]\s*\d+\.?\d*)?/i);
        if (match) {
          params.m = match[1] ? parseFloat(match[1]) : 1;
          params.b = match[2] ? parseFloat(match[2].replace(/\s/g, '')) : 0;
        }
        break;
      }

      case 'quadratic': {
        // y = ax² + bx + c
        const match = equation.match(/y\s*=\s*([+-]?\d*\.?\d*)\s*x\s*²\s*([+-]\s*\d*\.?\d*\s*x)?\s*([+-]\s*\d+\.?\d*)?/i);
        if (match) {
          params.a = match[1] ? parseFloat(match[1]) : 1;
          params.b = match[2] ? parseFloat(match[2].replace(/\s|x/g, '')) : 0;
          params.c = match[3] ? parseFloat(match[3].replace(/\s/g, '')) : 0;
        }
        break;
      }

      case 'circle': {
        // (x-h)² + (y-k)² = r²
        const match = equation.match(/\(x\s*([+-])\s*(\d+\.?\d*)\)\s*²\s*\+\s*\(y\s*([+-])\s*(\d+\.?\d*)\)\s*²\s*=\s*(\d+\.?\d*)/i);
        if (match) {
          params.h = (match[1] === '-' ? 1 : -1) * parseFloat(match[2]);
          params.k = (match[3] === '-' ? 1 : -1) * parseFloat(match[4]);
          params.r = Math.sqrt(parseFloat(match[5]));
        }
        break;
      }

      case 'trigonometric': {
        // y = a·sin(bx + c)
        const match = equation.match(/y\s*=\s*([+-]?\d*\.?\d*)\s*sin\s*\(\s*([+-]?\d*\.?\d*)\s*x\s*([+-]\s*\d+\.?\d*)?\s*\)/i);
        if (match) {
          params.a = match[1] ? parseFloat(match[1]) : 1;
          params.b = match[2] ? parseFloat(match[2]) : 1;
          params.c = match[3] ? parseFloat(match[3].replace(/\s/g, '')) : 0;
        }
        break;
      }

      case 'exponential': {
        // y = a·e^(bx)
        const match = equation.match(/y\s*=\s*([+-]?\d*\.?\d*)\s*e\s*\^\s*\(\s*([+-]?\d*\.?\d*)\s*x\s*\)/i);
        if (match) {
          params.a = match[1] ? parseFloat(match[1]) : 1;
          params.b = match[2] ? parseFloat(match[2]) : 1;
        }
        break;
      }
    }
  } catch (error) {
    console.warn('Failed to parse parameters:', error);
  }

  return Object.keys(params).length > 0 ? params : undefined;
}

/**
 * Check if content has explicit graph visualization marker
 */
export function hasGraphVisualizationMarker(content: string): boolean {
  const markers = [
    '### GRAPH:',
    '### 그래프:',
    '[GRAPH]',
    '[그래프]',
    '📊 그래프',
    '📈 시각화',
  ];

  return markers.some(marker => content.includes(marker));
}

/**
 * Extract clean content without graph markers
 */
export function extractCleanContentWithoutGraph(content: string): string {
  // Remove graph markers
  let cleaned = content
    .replace(/### GRAPH:.*$/gm, '')
    .replace(/### 그래프:.*$/gm, '')
    .replace(/\[GRAPH\].*$/gm, '')
    .replace(/\[그래프\].*$/gm, '')
    .replace(/📊 그래프.*$/gm, '')
    .replace(/📈 시각화.*$/gm, '');

  return cleaned.trim();
}
