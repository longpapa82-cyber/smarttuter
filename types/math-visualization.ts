// types/math-visualization.ts - 수학 시각화 타입 정의

/**
 * 수학 함수 타입
 */
export type FunctionType =
  | 'linear'           // y = ax + b
  | 'quadratic'        // y = ax² + bx + c
  | 'cubic'            // y = ax³ + bx² + cx + d
  | 'exponential'      // y = a * e^(bx)
  | 'logarithmic'      // y = a * log(bx)
  | 'trigonometric'    // y = a * sin(bx + c)
  | 'polynomial'       // Custom polynomial
  | 'custom';          // User-defined expression

/**
 * 변수 슬라이더 설정
 */
export interface VariableSlider {
  variable: string;       // 'a', 'b', 'c', etc.
  label: string;          // Display label
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  value: number;
}

/**
 * 그래프 포인트
 */
export interface GraphPoint {
  x: number;
  y: number;
}

/**
 * 함수 그래프 데이터
 */
export interface FunctionGraph {
  id: string;
  type: FunctionType;
  expression: string;     // Math expression (e.g., "2*x + 3")
  sliders: VariableSlider[];
  points: GraphPoint[];
  color: string;
  visible: boolean;
  label?: string;
}

/**
 * 그래프 설정
 */
export interface GraphConfig {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  gridSize: number;       // Grid spacing
  showGrid: boolean;
  showAxis: boolean;
  showLabels: boolean;
}

/**
 * 기하 도형 타입
 */
export type GeometryType =
  | 'point'
  | 'line'
  | 'circle'
  | 'triangle'
  | 'rectangle'
  | 'polygon';

/**
 * 기하 도형 점
 */
export interface GeometryPoint {
  id: string;
  x: number;
  y: number;
  draggable: boolean;
  label?: string;
}

/**
 * 기하 도형
 */
export interface GeometryShape {
  id: string;
  type: GeometryType;
  points: GeometryPoint[];
  color: string;
  fillColor?: string;
  strokeWidth?: number;
  label?: string;
}

/**
 * 애니메이션 설정
 */
export interface AnimationConfig {
  enabled: boolean;
  duration: number;       // ms
  fps: number;
  loop: boolean;
  variable: string;       // Which slider to animate
  from: number;
  to: number;
}

/**
 * 수학 시각화 세션
 */
export interface MathVisualizationSession {
  id: string;
  userId: string;
  topic: string;          // "이차함수", "삼각함수", etc.
  difficulty: 'beginner' | 'intermediate' | 'advanced';

  graphs: FunctionGraph[];
  geometries: GeometryShape[];
  config: GraphConfig;
  animation?: AnimationConfig;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * 수학 개념 유형
 */
export type MathConcept =
  | 'linear-function'         // 일차함수
  | 'quadratic-function'      // 이차함수
  | 'cubic-function'          // 삼차함수
  | 'exponential-function'    // 지수함수
  | 'logarithmic-function'    // 로그함수
  | 'trigonometric-function'  // 삼각함수
  | 'geometry-basic'          // 기하 기본
  | 'geometry-triangle'       // 삼각형
  | 'geometry-circle'         // 원
  | 'calculus-derivative'     // 미분
  | 'calculus-integral';      // 적분

/**
 * 수학 학습 예제
 */
export interface MathExample {
  id: string;
  concept: MathConcept;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';

  // 초기 설정
  initialGraph: Partial<FunctionGraph>;
  initialConfig: Partial<GraphConfig>;

  // 학습 목표
  learningGoals: string[];

  // 탐구 질문
  explorationQuestions: string[];

  // 힌트
  hints: string[];
}

/**
 * 인터랙션 이벤트
 */
export interface InteractionEvent {
  type: 'slider-change' | 'point-drag' | 'zoom' | 'pan';
  timestamp: Date;
  data: any;
}

/**
 * 수학 표현식 파싱 결과
 */
export interface ParsedExpression {
  original: string;
  normalized: string;     // Normalized for evaluation
  latex: string;          // LaTeX representation
  variables: string[];    // Extracted variables
  isValid: boolean;
  error?: string;
}
