// Browser Native Handwriting Recognition API Type Definitions
// https://wicg.github.io/handwriting-recognition/

interface HandwritingPoint {
  x: number;
  y: number;
  t?: number; // timestamp (optional)
}

interface HandwritingStroke {
  points: HandwritingPoint[];
}

interface HandwritingDrawing {
  strokes: HandwritingStroke[];
}

interface HandwritingHints {
  recognitionType?: 'text' | 'email' | 'number' | 'per-character';
  inputType?: 'mouse' | 'touch' | 'pen';
  textContext?: string;
  alternatives?: number;
}

interface HandwritingModelConstraint {
  languages?: string[];
}

interface HandwritingRecognizerQueryResult {
  textAlternatives?: string[];
  textSegmentation?: Array<{
    graphemeCluster: string;
    beginIndex: number;
    endIndex: number;
    drawingSegments: Array<{
      strokeIndex: number;
      beginPointIndex: number;
      endPointIndex: number;
    }>;
  }>;
}

interface HandwritingRecognizer {
  startDrawing(hints?: HandwritingHints): HandwritingDrawing;
  getPrediction(): Promise<HandwritingRecognizerQueryResult[]>;
  finish(): void;
}

interface Navigator {
  queryHandwritingRecognizer?: (
    constraint: HandwritingModelConstraint
  ) => Promise<HandwritingRecognizerQueryResult | null>;

  createHandwritingRecognizer?: (
    constraint: HandwritingModelConstraint
  ) => Promise<HandwritingRecognizer>;
}

// Extended Window interface for feature detection
interface Window {
  HandwritingRecognizer?: {
    queryRecognizer: (constraint: HandwritingModelConstraint) => Promise<any>;
  };
}
