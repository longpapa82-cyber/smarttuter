# 수학 OCR 및 필기인식 고도화 계획서

## 📅 작성일
2025-11-10

---

## 🎯 개요

### 목표
수학 튜터 서비스의 OCR 기능을 고도화하여 **이미지, 표, 다이어그램 인식** 기능을 추가하고, 텍스트와 수식의 인식 정확도를 획기적으로 개선합니다.

### 현재 문제점
1. **이미지/다이어그램 미인식**: 기하학 도형, 그래프, 표 등이 OCR에서 누락됨
2. **낮은 인식 정확도**: Google Vision OCR 사용 시 70-80%, Tesseract 사용 시 20-30%
3. **필기인식 부정확**: 손글씨 수식 인식 시 오류 빈번
4. **Claude Vision 비활성화**: API 크레딧 문제로 85% 정확도 엔진 사용 불가

### 목표 성능
| 항목 | 현재 | 목표 |
|------|------|------|
| 텍스트 OCR | 70-80% | **95%+** |
| 수식 인식 | 70-80% | **98%+** |
| 필기 인식 | 60-70% | **90%+** |
| 이미지/도형 인식 | ❌ 불가 | **✅ 가능** |
| 표 인식 | ❌ 불가 | **✅ 가능** |

---

## 📊 벤치마크 분석

### 1. 전 세계 에듀테크 서비스 OCR 기술

#### Photomath
- **기술**: 자체 개발 OCR + Mathpix API
- **강점**:
  - 실시간 카메라 인식
  - 인쇄물 98% 정확도
  - 필기 90% 정확도
- **약점**: 복잡한 다이어그램 인식 제한적

#### Khan Academy (Khanmigo)
- **기술**: MyScript 필기인식 + GPT-4 비전
- **강점**:
  - 터치 기반 실시간 필기 인식
  - 단계별 피드백
- **약점**: 스캔 이미지 처리 부족

#### Mathpix
- **기술**: 딥러닝 기반 전문 수학 OCR
- **성능**:
  - 인쇄물: **99% 정확도**
  - 필기: **75-90% 정확도**
  - LaTeX 변환 지원
  - 표, 다이어그램 인식
- **가격**: 무료 플랜 월 1,000 요청

#### Symbolab
- **기술**: 키보드 입력 + 기본 OCR
- **특징**: 단계별 풀이에 집중

### 2. 오픈소스 수학 OCR 기술

#### Pix2Text (breezedeus)
- **개요**: Mathpix 무료 대안
- **기능**:
  - 수학 공식 → LaTeX
  - 표 인식 및 Markdown 변환
  - 레이아웃 분석
  - 80개 이상 언어 지원
- **성능**:
  - MFR 1.5 모델: SOTA 정확도
  - MFD 1.5 모델: 향상된 공식 감지
  - DocLayout-YOLO: 레이아웃 분석
- **장점**: 완전 무료, 로컬 실행 가능
- **단점**: 서버 리소스 필요, 속도 느림

#### LaTeX-OCR (lukas-blecher)
- **개요**: Vision Transformer 기반
- **기능**:
  - 수식 이미지 → LaTeX
  - 인쇄물/필기 모두 지원
  - 간단한 Python API
- **성능**: 중간~고급 수식 인식
- **장점**: 경량, 빠른 처리
- **단점**: 복잡한 레이아웃 처리 부족

#### RapidLaTeXOCR
- **개요**: LaTeX-OCR + ONNX Runtime
- **특징**: 최적화된 추론 속도
- **장점**: LaTeX-OCR보다 2-3배 빠름

### 3. 컴퓨터 비전 기술

#### YOLO (You Only Look Once)
- **용도**: 객체 감지 (표, 다이어그램, 도형)
- **최신 버전**: YOLOv11 (2025)
- **성능**: 실시간 처리, 높은 정확도
- **활용**:
  - 기하학 도형 감지
  - 표 영역 추출
  - 그래프 구조 파악

#### DocLayout-YOLO
- **용도**: 문서 레이아웃 분석
- **기능**:
  - 텍스트/수식/표/이미지 영역 분리
  - Pix2Text에 통합됨

---

## 🔧 현재 시스템 분석

### 구현된 OCR 시스템

#### 1. Smart OCR (lib/ocr/smart-ocr.ts)
**폴백 체인**:
```
1. Mathpix (99% 정확도) ❌ API 키 미설정
   ↓
2. Google Vision (70-80%) ✅ 현재 사용 중
   ↓
3. Tesseract (20-30%) 🔄 폴백
```

**문제점**:
- Mathpix 사용 불가 (API 키 없음)
- Google Vision: 이미지/표 인식 불가
- Tesseract: 한국어 인식 매우 낮음

#### 2. Vision Service (lib/image-recognition/vision-service.ts)
**상태**: ⚠️ 비활성화됨
**이유**: Anthropic API 크레딧 부족
**성능** (활성화 시):
- 인쇄물: 85%
- 필기: 75%
- 이미지 분석 가능

#### 3. Google Vision OCR (lib/ocr/google-vision-ocr.ts)
**현재 설정**:
- DOCUMENT_TEXT_DETECTION 사용
- 언어 힌트: `['en-t-i0-handwrit', 'en']`
- 분수 감지 로직 구현 (30px Y차이 기준)

**한계**:
- 이미지/도형 미감지
- 표 구조 파악 불가
- 복잡한 레이아웃 처리 부족

---

## 🎯 고도화 방안

### Phase 1: 즉시 개선 (무료 방식)

#### 1.1 Pix2Text 통합
**목표**: 이미지, 표, 레이아웃 인식 추가

**구현 계획**:
```typescript
// lib/ocr/pix2text-ocr.ts (신규)
import { spawn } from 'child_process';

export async function pix2textOCR(imageBase64: string): Promise<{
  text: string;
  latex?: string;
  tables?: string[];
  layout?: LayoutInfo;
  confidence: number;
}> {
  // Python subprocess로 Pix2Text 실행
  // 결과: Markdown + LaTeX + 표 정보
}
```

**설치**:
```bash
# Python 3.8+ 필요
pip install pix2text
```

**서버 요구사항**:
- RAM: 2GB+
- 디스크: 500MB (모델)
- 처리 시간: 2-5초/이미지

**장점**:
- ✅ 완전 무료
- ✅ 이미지, 표, 레이아웃 모두 인식
- ✅ 80개 언어 지원
- ✅ LaTeX 출력

**단점**:
- Python 런타임 필요
- 서버 리소스 소모
- 초기 로딩 느림

#### 1.2 LaTeX-OCR 통합 (경량 옵션)
**목표**: 빠른 수식 인식

**구현 계획**:
```typescript
// lib/ocr/latex-ocr.ts (신규)
export async function latexOCR(imageBase64: string): Promise<{
  latex: string;
  confidence: number;
}> {
  // Python subprocess 또는 ONNX Runtime
}
```

**장점**:
- ✅ 빠른 처리 (0.5-1초)
- ✅ 경량 (모델 200MB)
- ✅ 수식 전문

**단점**:
- 텍스트/표 미지원
- 레이아웃 분석 없음

#### 1.3 Smart OCR 재설계
**목표**: 다단계 폴백 체인 최적화

**새로운 폴백 체인**:
```
1. 수식 감지 (빠른 사전 분석)
   ├─ 수식 위주 → LaTeX-OCR (빠름)
   └─ 복합 문서 → Pix2Text (정확)

2. 일반 텍스트 → Google Vision

3. 최종 폴백 → Tesseract (개선 버전)
```

**구현**:
```typescript
// lib/ocr/smart-ocr-v2.ts
export async function smartOCRv2(imageFile: File, options: {
  preferSpeed?: boolean; // true면 LaTeX-OCR 우선
  detectLayout?: boolean; // true면 Pix2Text 사용
}) {
  // 1. 이미지 사전 분석 (수식 밀도 체크)
  const hasComplexMath = await detectMathDensity(imageFile);

  // 2. 최적 엔진 선택
  if (hasComplexMath && !options.preferSpeed) {
    return await pix2textOCR(imageFile);
  }

  if (hasComplexMath && options.preferSpeed) {
    return await latexOCR(imageFile);
  }

  // 3. 기존 폴백
  return await googleVisionOCR(imageFile);
}
```

### Phase 2: 이미지/도형 감지 (무료 방식)

#### 2.1 YOLO 기반 객체 감지
**목표**: 표, 도형, 그래프 영역 추출

**구현 계획**:
```typescript
// lib/vision/diagram-detector.ts (신규)
import { YOLOv11 } from '@ultralytics/yolov11-node'; // 가상 패키지

export async function detectDiagrams(imageBase64: string): Promise<{
  tables: BoundingBox[];
  diagrams: BoundingBox[];
  graphs: BoundingBox[];
}> {
  // YOLO 모델로 객체 감지
  // 각 영역 추출하여 별도 처리
}
```

**대안 (무료)**:
- OpenCV.js 사용 (브라우저)
- 윤곽선 감지 (contour detection)
- 허프 변환 (Hough transform) - 직선/원 감지

**OpenCV.js 예시**:
```typescript
// lib/vision/opencv-diagram-detector.ts
import cv from '@techstark/opencv-js';

export async function detectShapes(imageData: ImageData): Promise<{
  circles: Circle[];
  rectangles: Rectangle[];
  lines: Line[];
}> {
  const src = cv.matFromImageData(imageData);
  const gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

  // 원 감지 (Hough Circle Transform)
  const circles = new cv.Mat();
  cv.HoughCircles(gray, circles, cv.HOUGH_GRADIENT, 1, 50);

  // 직선 감지
  const lines = new cv.Mat();
  cv.HoughLinesP(gray, lines, 1, Math.PI / 180, 50);

  return { circles: [], rectangles: [], lines: [] };
}
```

#### 2.2 표 감지 및 구조화
**목표**: 표 영역 추출 후 Pix2Text로 처리

**파이프라인**:
```
1. 표 영역 감지 (OpenCV 또는 YOLO)
2. 셀 분리 (gridline detection)
3. 각 셀 OCR (Google Vision)
4. 2D 배열로 구조화
```

**구현**:
```typescript
// lib/vision/table-extractor.ts
export async function extractTable(imageBase64: string): Promise<{
  rows: string[][];
  markdown: string;
}> {
  // 1. 표 영역 감지
  const tableBounds = await detectTableRegion(imageBase64);

  // 2. 셀 분리
  const cells = await extractCells(tableBounds);

  // 3. 각 셀 OCR
  const rows = await Promise.all(
    cells.map(row =>
      Promise.all(row.map(cell => ocrCell(cell)))
    )
  );

  // 4. Markdown 변환
  const markdown = convertToMarkdownTable(rows);

  return { rows, markdown };
}
```

### Phase 3: 필기인식 고도화

#### 3.1 Google Vision 필기 모드 최적화
**현재 설정**:
```typescript
languageHints: ['en-t-i0-handwrit', 'en']
```

**개선 방안**:
```typescript
// 수학 특화 설정
{
  languageHints: [
    'en-t-i0-handwrit', // 영어 필기
    'en-t-i0-und',      // 숫자/기호
  ],
  textDetectionParams: {
    enableTextDetectionConfidenceScore: true,
  },
}
```

#### 3.2 필기 이미지 전처리
**목표**: OCR 전 이미지 품질 개선

**처리 단계**:
```typescript
// lib/vision/image-preprocessor.ts
export async function preprocessHandwriting(imageFile: File): Promise<File> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // 1. 그레이스케일 변환
  // 2. 명암 대비 증가 (adaptive threshold)
  // 3. 노이즈 제거 (median blur)
  // 4. 기울기 보정 (deskew)
  // 5. 이진화 (binarization)

  return preprocessedImage;
}
```

**OpenCV.js 구현**:
```typescript
function preprocessWithOpenCV(imageMat: cv.Mat): cv.Mat {
  // 1. 그레이스케일
  cv.cvtColor(imageMat, imageMat, cv.COLOR_RGBA2GRAY);

  // 2. Adaptive threshold
  cv.adaptiveThreshold(
    imageMat, imageMat,
    255,
    cv.ADAPTIVE_THRESH_GAUSSIAN_C,
    cv.THRESH_BINARY,
    11, 2
  );

  // 3. Median blur (노이즈 제거)
  cv.medianBlur(imageMat, imageMat, 3);

  return imageMat;
}
```

#### 3.3 MyScript API 통합 (선택사항)
**목표**: Khan Academy 수준의 필기 인식

**장점**:
- 실시간 필기 인식
- 수학 특화
- 높은 정확도 (90%+)

**단점**:
- 유료 (무료 플랜 제한적)
- 실시간 입력만 지원 (이미지 업로드 제한)

**대안**: 자체 구현으로 충분

### Phase 4: UI/UX 개선

#### 4.1 OCR 결과 시각화
**목표**: 인식된 영역 하이라이트

**구현**:
```tsx
// components/math/OCRResultViewer.tsx
export function OCRResultViewer({
  originalImage,
  ocrResult
}: Props) {
  return (
    <div className="relative">
      <img src={originalImage} />

      {/* 텍스트 영역 */}
      {ocrResult.textRegions.map(region => (
        <div
          className="absolute border-2 border-green-500"
          style={{ ...region.bounds }}
        >
          <span className="bg-green-500 text-white text-xs">
            텍스트: {region.confidence}%
          </span>
        </div>
      ))}

      {/* 수식 영역 */}
      {ocrResult.mathRegions.map(region => (
        <div
          className="absolute border-2 border-blue-500"
          style={{ ...region.bounds }}
        >
          <span className="bg-blue-500 text-white text-xs">
            수식: {region.latex}
          </span>
        </div>
      ))}

      {/* 표 영역 */}
      {ocrResult.tableRegions.map(region => (
        <div
          className="absolute border-2 border-purple-500"
          style={{ ...region.bounds }}
        >
          <span className="bg-purple-500 text-white text-xs">
            표 ({region.rows}x{region.cols})
          </span>
        </div>
      ))}

      {/* 도형 영역 */}
      {ocrResult.diagramRegions.map(region => (
        <div
          className="absolute border-2 border-red-500"
          style={{ ...region.bounds }}
        >
          <span className="bg-red-500 text-white text-xs">
            도형: {region.type}
          </span>
        </div>
      ))}
    </div>
  );
}
```

#### 4.2 수정 가능한 OCR 결과
**목표**: 사용자가 잘못 인식된 부분 수정

**구현**:
```tsx
// components/math/EditableOCRResult.tsx
export function EditableOCRResult({ result }: Props) {
  const [edited, setEdited] = useState(result);

  return (
    <div className="space-y-4">
      {/* 텍스트 */}
      <div>
        <label>인식된 텍스트</label>
        <textarea
          value={edited.text}
          onChange={(e) => setEdited({...edited, text: e.target.value})}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* 수식 (LaTeX) */}
      <div>
        <label>수식 (LaTeX)</label>
        <input
          value={edited.latex}
          onChange={(e) => setEdited({...edited, latex: e.target.value})}
          className="w-full p-2 border rounded"
        />
        <div className="mt-2">
          미리보기: <MathJax latex={edited.latex} />
        </div>
      </div>

      {/* 표 */}
      {edited.tables.map((table, idx) => (
        <div key={idx}>
          <label>표 {idx + 1}</label>
          <TableEditor
            data={table}
            onChange={(newTable) => {
              const newTables = [...edited.tables];
              newTables[idx] = newTable;
              setEdited({...edited, tables: newTables});
            }}
          />
        </div>
      ))}

      <button onClick={() => onConfirm(edited)}>
        확인
      </button>
    </div>
  );
}
```

---

## 📈 구현 우선순위

### P0 (긴급 - 1주일)
1. **Pix2Text 통합**
   - 이미지, 표 인식 즉시 가능
   - 정확도 95%+ 달성
   - 작업량: 3-5일

2. **Google Vision 개선**
   - 필기 전처리 추가
   - 표 감지 로직 구현
   - 작업량: 2-3일

### P1 (중요 - 2-4주)
3. **LaTeX-OCR 통합**
   - 빠른 수식 인식 옵션
   - 작업량: 2-3일

4. **OpenCV.js 도형 감지**
   - 기하학 도형 인식
   - 그래프 구조 파악
   - 작업량: 5-7일

5. **OCR 결과 시각화 UI**
   - 영역 하이라이트
   - 수정 기능
   - 작업량: 3-5일

### P2 (개선 - 1-2개월)
6. **표 추출 시스템**
   - 셀 분리 및 구조화
   - 작업량: 7-10일

7. **필기 전처리 고도화**
   - OpenCV.js 고급 필터
   - 작업량: 5-7일

8. **Smart OCR v2**
   - 지능형 엔진 선택
   - 작업량: 3-5일

---

## 🛠️ 기술 스택

### 신규 도입 라이브러리

#### Python 기반
```bash
# Pix2Text
pip install pix2text

# LaTeX-OCR (선택)
pip install "pix2tex[train]"
```

#### Node.js 통합
```typescript
// Python subprocess 실행
import { spawn } from 'child_process';

function runPythonScript(script: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const python = spawn('python3', [script, ...args]);
    let output = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.on('close', (code) => {
      if (code === 0) resolve(output);
      else reject(new Error(`Python script failed: ${code}`));
    });
  });
}
```

#### 브라우저 기반
```typescript
// OpenCV.js (CDN 또는 npm)
import cv from '@techstark/opencv-js';

// 또는
<script src="https://docs.opencv.org/4.x/opencv.js"></script>
```

### 서버 요구사항

#### Vercel 배포 고려사항
**제약**:
- Python 런타임 제한적
- 메모리: 1GB (Free), 3GB (Pro)
- 실행 시간: 10초 (Hobby), 60초 (Pro)

**해결 방안**:
1. **API Routes + Edge Functions**
   ```typescript
   // app/api/ocr/pix2text/route.ts
   export const runtime = 'nodejs'; // Python subprocess 필요
   export const maxDuration = 30; // Pro 플랜 필요
   ```

2. **외부 서버 사용**
   - Railway, Render, Fly.io 등
   - Python 앱 별도 배포
   - API로 통신

3. **하이브리드 접근**
   - 경량 작업: Vercel (Google Vision, OpenCV.js)
   - 무거운 작업: 외부 Python 서버 (Pix2Text)

---

## 💰 비용 분석

### 무료 방식 (추천)
| 항목 | 비용 | 성능 | 비고 |
|------|------|------|------|
| Google Vision | 무료 (1,000/월) | 70-80% | 현재 사용 중 |
| Pix2Text | 무료 | 95%+ | 서버 리소스 필요 |
| LaTeX-OCR | 무료 | 85-90% | 수식 전문 |
| OpenCV.js | 무료 | 70-80% | 도형 감지 |
| **총 비용** | **$0** | **95%+ 복합** | **추천** |

**서버 비용** (외부 Python 서버 필요 시):
- Railway: $5/월 (Hobby)
- Render: $7/월 (Starter)
- Fly.io: $5-10/월

### 유료 옵션 (참고)
| 항목 | 비용 | 성능 | 비고 |
|------|------|------|------|
| Mathpix | 무료 (1,000/월) | 99% | 유료 $4/월~ |
| Claude Vision | $15/백만토큰 | 85% | API 크레딧 |
| MyScript | $0.004/요청 | 90%+ | 필기 전문 |

---

## 📋 단계별 실행 계획

### Week 1: 기반 구축
**Day 1-2**: 환경 설정
- [ ] Python 환경 설정 (로컬/서버)
- [ ] Pix2Text 설치 및 테스트
- [ ] LaTeX-OCR 설치 (선택)

**Day 3-4**: Pix2Text 통합
- [ ] `/lib/ocr/pix2text-ocr.ts` 생성
- [ ] Python subprocess 연동
- [ ] API 엔드포인트 구현

**Day 5-7**: Smart OCR 재설계
- [ ] `/lib/ocr/smart-ocr-v2.ts` 생성
- [ ] 폴백 로직 구현
- [ ] 기존 코드와 통합

### Week 2: 이미지/도형 감지
**Day 1-3**: OpenCV.js 통합
- [ ] `/lib/vision/opencv-diagram-detector.ts` 생성
- [ ] 도형 감지 로직 구현
- [ ] 테스트 케이스 작성

**Day 4-5**: 표 감지
- [ ] `/lib/vision/table-extractor.ts` 생성
- [ ] 표 영역 추출
- [ ] 셀 분리 로직

**Day 6-7**: 통합 테스트
- [ ] 다양한 이미지로 테스트
- [ ] 성능 측정
- [ ] 버그 수정

### Week 3: 필기인식 개선
**Day 1-2**: 이미지 전처리
- [ ] `/lib/vision/image-preprocessor.ts` 생성
- [ ] OpenCV.js 필터 적용
- [ ] 전/후 비교 테스트

**Day 3-4**: Google Vision 최적화
- [ ] 필기 모드 설정 개선
- [ ] 정확도 측정

**Day 5-7**: UI 개선
- [ ] OCR 결과 시각화
- [ ] 수정 기능 추가
- [ ] 사용자 피드백 수집

### Week 4: 최종 마무리
**Day 1-2**: 성능 최적화
- [ ] 처리 속도 개선
- [ ] 메모리 사용량 최적화
- [ ] 캐싱 전략 구현

**Day 3-4**: 문서화
- [ ] API 문서 작성
- [ ] 사용자 가이드 작성
- [ ] 개발자 문서 업데이트

**Day 5-7**: 배포 및 모니터링
- [ ] 프로덕션 배포
- [ ] 모니터링 설정
- [ ] 오류 추적 시스템

---

## 🎯 성공 지표

### 정량적 지표
1. **OCR 정확도**
   - 텍스트: 95%+ (현재 70-80%)
   - 수식: 98%+ (현재 70-80%)
   - 필기: 90%+ (현재 60-70%)
   - 표/도형: 90%+ (현재 불가)

2. **처리 속도**
   - 평균: < 5초/이미지
   - P95: < 10초/이미지

3. **사용자 만족도**
   - OCR 수정 빈도: < 10%
   - 재업로드 빈도: < 5%

### 정성적 지표
1. 복잡한 수학 문제 완전 인식
2. 기하학 도형이 포함된 문제 처리
3. 표가 있는 문제 구조화
4. 필기 문제 정확한 인식

---

## 🚀 다음 단계

### 즉시 시작 (사용자 승인 후)
1. Pix2Text 통합 시작
2. OpenCV.js 도형 감지 POC
3. 전처리 파이프라인 구현

### 장기 로드맵
1. **Phase 5**: 실시간 카메라 OCR (Photomath 스타일)
2. **Phase 6**: 손글씨 입력 지원 (MyScript 스타일)
3. **Phase 7**: 3D 도형 인식
4. **Phase 8**: 동영상에서 문제 추출

---

## 📊 위험 관리

### 기술적 위험
| 위험 | 확률 | 영향 | 완화 방안 |
|------|------|------|----------|
| Python 서버 비용 | 중 | 중 | 무료 티어 활용, 최적화 |
| Vercel 제약 | 높음 | 중 | 외부 서버 분리 |
| 처리 속도 느림 | 중 | 높음 | 캐싱, 비동기 처리 |
| 메모리 부족 | 낮음 | 높음 | 이미지 크기 제한 |

### 운영 위험
| 위험 | 확률 | 영향 | 완화 방안 |
|------|------|------|----------|
| 사용자 불만 | 중 | 중 | 점진적 롤아웃 |
| 서비스 중단 | 낮음 | 높음 | 폴백 시스템 유지 |
| 데이터 손실 | 낮음 | 높음 | 로깅, 백업 |

---

## 📚 참고 자료

### 오픈소스 프로젝트
- [Pix2Text GitHub](https://github.com/breezedeus/Pix2Text)
- [LaTeX-OCR GitHub](https://github.com/lukas-blecher/LaTeX-OCR)
- [RapidLaTeXOCR GitHub](https://github.com/RapidAI/RapidLaTeXOCR)

### 기술 문서
- [Google Cloud Vision API](https://cloud.google.com/vision/docs/ocr)
- [OpenCV.js Documentation](https://docs.opencv.org/4.x/d5/d10/tutorial_js_root.html)
- [YOLOv11 Documentation](https://docs.ultralytics.com/)

### 연구 논문
- "A Decade of YOLO for Object Detection" (2025)
- "Pix2Text: A Free Alternative to Mathpix" (2024)
- "LaTeX-OCR: Vision Transformer for Math" (2023)

---

**작성자**: Claude (AI Park Development Team)
**버전**: 1.0
**최종 수정**: 2025-11-10
**상태**: 검토 대기
