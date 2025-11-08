# Phase 2: 필기 인식 기능 추가 - 상세 계획서

## 작성일
2025-11-06

## 조사 결과 요약

### 🏆 최고 수준 필기 인식 기술 (2025년 기준)

| 기술 | 정확도 | 특징 | 비용 | 우선순위 |
|------|--------|------|------|---------|
| **MyScript iink SDK 3.0** | 90-95% | 200+ 수학 기호, Transformer AI, 최신 2025 | 월 2,000 요청 무료 | **1순위** |
| **Mathpix Handwriting** | 98% | 10만+ 학습 데이터, 이미지+필기 모두 | $0.004/요청 | 2순위 |
| **Photomath Neural Network** | 98% | 10만+ 이미지 학습, Microblink 엔진 | 비공개 | 참고용 |

### 💡 주요 발견사항

1. **MyScript iink SDK 3.0** (2025년 최신)
   - Encoder-Decoder Transformer 아키텍처
   - 12만 개 실제 사용자 수식으로 학습
   - 오류율 50% 감소 (이전 버전 대비)
   - 무료: 월 2,000 요청
   - 20년+ 연구 개발 경험

2. **Khan Academy Khanmigo**
   - 수학 팔레트 (키보드 기반)
   - 음성-텍스트 변환 지원
   - ❌ 필기 인식 기능 없음

3. **Canvas 기술 스택**
   - React에서 `onPointerDown/Move/Up` 이벤트 사용 권장
   - `touch-action: none` CSS 필수
   - Atrament.js: 압력 감지 지원
   - react-signature-canvas: 시그니처 캡처 전문

---

## Phase 2 전략

### 접근 방식: 하이브리드 인식 시스템

```
사용자 입력
    ↓
[필기 캔버스] ←→ [이미지 업로드]
    ↓                ↓
[Canvas → 이미지 변환]
    ↓
┌─────────────────────────────┐
│   Smart Handwriting OCR     │
├─────────────────────────────┤
│ 1. MyScript iink (우선)     │
│ 2. Mathpix OCR (폴백)       │
│ 3. Google Vision (폴백)     │
│ 4. Tesseract (최종 폴백)    │
└─────────────────────────────┘
    ↓
[수식 텍스트] → 튜터 전송
```

**핵심 아이디어**:
- 필기 캔버스를 이미지로 변환
- 기존 Smart OCR 시스템 재사용
- MyScript를 최우선 엔진으로 추가

---

## Phase 2 세부 단계

### Phase 2.1: MyScript Math Web 통합 ✨
**목표**: 세계 최고 수준 필기 인식 API 통합

**구현 파일**: `lib/ocr/myscript-handwriting.ts`

```typescript
// MyScript iink SDK Web 통합
export interface MyScriptResult {
  latex: string;
  mathML: string;
  text: string;
  confidence: number;
  error?: string;
}

export async function myScriptRecognize(
  strokes: StrokeData[], // 캔버스 스트로크 데이터
  imageBase64?: string    // 또는 이미지
): Promise<MyScriptResult>
```

**API 설정**:
```bash
# .env.local
NEXT_PUBLIC_MYSCRIPT_APPLICATION_KEY=your_key
NEXT_PUBLIC_MYSCRIPT_HMAC_KEY=your_hmac_key
```

**무료 플랜**: 월 2,000 요청

---

### Phase 2.2: 필기 입력 캔버스 UI 구현 🎨
**목표**: 터치/마우스/펜 지원 필기 입력 UI

**구현 파일**: `components/math/MathHandwritingCanvas.tsx`

**주요 기능**:
```typescript
interface HandwritingCanvasProps {
  onRecognized: (text: string) => void;
  onClose: () => void;
}

// 기능 목록
- Pointer Events 지원 (터치/마우스/펜)
- 실시간 스트로크 렌더링
- 지우기 기능
- 전체 초기화
- 실행 취소 (Undo)
- 압력 감지 (지원 기기만)
- 인식 버튼
- 튜터 전송 버튼
```

**UI 디자인**:
```
┌──────────────────────────────────┐
│  ✏️ 수식을 그려주세요            │
├──────────────────────────────────┤
│                                  │
│     [캔버스 영역]                │
│     (흰색 배경)                  │
│                                  │
├──────────────────────────────────┤
│ [🗑️ 초기화] [↶ 실행취소]        │
│           [🔍 인식하기]          │
└──────────────────────────────────┘
```

**기술 스택**:
- HTML5 Canvas API
- Pointer Events (터치/펜 통합)
- CSS: `touch-action: none`
- Framer Motion (애니메이션)

---

### Phase 2.3: Smart OCR 업그레이드 🔄
**목표**: MyScript를 최우선 엔진으로 추가

**수정 파일**: `lib/ocr/smart-ocr.ts`

**새로운 폴백 전략**:
```typescript
1. MyScript iink (우선순위 1) - 필기 전용, 95% 정확도
   ↓ (실패 또는 이미지 입력)
2. Mathpix OCR (우선순위 2) - 이미지+필기, 98-99%
   ↓ (실패)
3. Google Vision (우선순위 3) - 일반 텍스트, 70-80% 수식
   ↓ (실패)
4. Tesseract (우선순위 4) - 무료 폴백, 30-40% 수식
```

**업데이트 함수**:
```typescript
export async function smartHandwritingOCR(
  strokes?: StrokeData[],
  imageFile?: File
): Promise<SmartOCRResult> {
  // 필기 데이터 있으면 MyScript 우선
  if (strokes && isMyScriptAvailable()) {
    return myScriptOCR(strokes);
  }

  // 이미지만 있으면 기존 Smart OCR
  return smartOCR(imageFile);
}
```

---

### Phase 2.4: MathImageUpload 통합 🔗
**목표**: 이미지 업로드 옆에 필기 입력 탭 추가

**수정 파일**: `components/math/MathImageUpload.tsx`

**UI 변경**:
```tsx
// 이전: 단일 이미지 업로드
[📷 이미지 업로드]

// 개선: 탭 인터페이스
┌─────────────────────────────────┐
│ [📷 사진] | [✏️ 필기]           │
├─────────────────────────────────┤
│  사진 탭: 기존 업로드 UI        │
│  필기 탭: HandwritingCanvas     │
└─────────────────────────────────┘
```

**구현**:
```typescript
const [activeTab, setActiveTab] = useState<'photo' | 'handwriting'>('photo');

{activeTab === 'photo' && <PhotoUploadUI />}
{activeTab === 'handwriting' && <MathHandwritingCanvas />}
```

---

### Phase 2.5: 사용자 경험 최적화 ✨

**개선사항**:

1. **로딩 상태 개선**
   ```
   필기 인식 중... MyScript AI 분석 중
   ```

2. **미리보기 기능**
   ```
   ┌──────────────────┐
   │ 입력한 필기      │
   │ ↓                │
   │ 인식된 수식:     │
   │ x² + 2x + 1 = 0  │
   └──────────────────┘
   ```

3. **오류 처리**
   ```typescript
   if (confidence < 0.6) {
     "인식 정확도가 낮습니다. 다시 그려주시거나 사진으로 업로드해주세요."
   }
   ```

4. **도움말**
   ```
   💡 팁:
   - 크고 명확하게 써주세요
   - 한 칸에 한 문자씩 써주세요
   - 분수는 가로줄을 명확히 그어주세요
   ```

---

## 기술 비교 및 선택 근거

### MyScript vs Mathpix (필기 인식)

| 항목 | MyScript iink | Mathpix |
|------|---------------|---------|
| 필기 전용 최적화 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 실시간 인식 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 무료 플랜 | 2,000/월 | 1,000/월 |
| 한국어 지원 | ✅ | ✅ |
| 업데이트 | 2025 최신 | 2024 |
| 수학 기호 | 200+ | 모든 LaTeX |
| 학습 데이터 | 12만 실사용 | 전문가 큐레이션 |

**결론**: MyScript를 최우선, Mathpix를 폴백으로 사용

---

## 예상 성능

### 정확도
- **명확한 필기**: 95%+ (MyScript)
- **일반 필기**: 85-90% (MyScript)
- **흐릿한 필기**: 70-80% (Mathpix 폴백)
- **매우 불량**: 30-40% (Tesseract 최종 폴백)

### 속도
- MyScript: ~1-2초 (WebSocket 실시간)
- Mathpix: ~2-3초 (REST API)
- 캔버스 렌더링: <16ms (60 FPS)

### 사용자 경험
- 필기 → 인식 → 확인 → 전송: ~5-10초
- 이미지 업로드 대비: 비슷하거나 더 빠름
- 모바일 친화성: ⭐⭐⭐⭐⭐

---

## 구현 순서

### Week 1: 기반 구축
- [x] 기술 조사 완료
- [ ] MyScript iink SDK 통합
- [ ] Canvas 컴포넌트 기본 구현

### Week 2: UI/UX
- [ ] 필기 캔버스 완성
- [ ] 탭 인터페이스 통합
- [ ] 반응형 디자인

### Week 3: 최적화
- [ ] 성능 튜닝
- [ ] 오류 처리
- [ ] 사용자 가이드

---

## API 키 발급 가이드

### MyScript iink SDK
1. https://developer.myscript.com/ 접속
2. 회원가입 후 Dashboard
3. "Create Application" 클릭
4. Application Key와 HMAC Key 복사
5. `.env.local`에 추가

```bash
NEXT_PUBLIC_MYSCRIPT_APPLICATION_KEY=your_app_key
NEXT_PUBLIC_MYSCRIPT_HMAC_KEY=your_hmac_key
```

**무료 플랜**:
- 월 2,000 요청
- 상업용 가능
- 지원 제한적

---

## 예상 효과

### 사용성 개선
- ✅ 모바일에서 수식 입력 간편화
- ✅ 키보드 없이 직관적 입력
- ✅ 태블릿/펜 사용자 최적화

### 정확도 개선
- 📈 필기 인식: 30-40% → **95%**
- 📈 사용자 만족도: 예상 +40%
- 📈 모바일 사용률: 예상 +60%

### 경쟁력 강화
- 🏆 Khan Academy 수준 도달 (필기 입력 우위)
- 🏆 Photomath/Mathway와 동등 수준
- 🏆 차별화: 이미지 + 필기 하이브리드

---

## 리스크 및 대응책

### 리스크 1: API 비용
- **문제**: 월 2,000 요청 초과 시 비용 발생
- **대응**: 무료 플랜 모니터링, Mathpix 폴백

### 리스크 2: 인식 정확도
- **문제**: 한국어 혼합 수식 인식률 낮을 수 있음
- **대응**: 사용자 피드백 수집, 재인식 기능

### 리스크 3: 모바일 성능
- **문제**: Canvas 렌더링 부하
- **대응**: 최적화, 스트로크 간소화

---

## 참고 자료

### MyScript 공식 문서
- https://developer.myscript.com/docs/interactive-ink/latest/web/
- https://github.com/MyScript/myscript-math-web

### Canvas 기술
- https://github.com/jakubfiala/atrament
- https://github.com/agilgur5/react-signature-canvas

### 경쟁사 벤치마크
- Photomath: 98% 필기 인식 (10만+ 학습 데이터)
- MyScript Nebo: 66개 언어, 세계 최고 수준
- Mathpix: 99% OCR, LaTeX 완벽 지원

---

## 다음 작업
Phase 2.1부터 순차 진행 (사용자 승인 대기 중)
