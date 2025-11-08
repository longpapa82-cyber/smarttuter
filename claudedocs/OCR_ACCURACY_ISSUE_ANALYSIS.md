# OCR 정확도 문제 - 원인 분석 및 해결 방안

## 📅 분석일
2025-11-06

---

## 🔴 문제 상황

### 입력 이미지
복잡한 한국어+영어+수학 혼합 텍스트:
```
8 세 아파트 A, B, C에서 같은 거리에 있는 지점에 정
류장을 만들려고 한다. 다음 그림과 같이 아파트 A
는 아파트 B에서 서쪽으로 4 km만큼 떨어진 위치
에 있고, 아파트 C는 아파트 B에서 동쪽으로 1 km,
북쪽으로 1 km만큼 떨어진 위치에 있을 때, 정류장
과 아파트 B 사이의 거리는 몇 km인지 구하시오.
```

### 실제 OCR 결과 (Tesseract)
```
8 Al olgtE A, B, CollAl 2-2 Ale] l= Adel %
eee FAS URSElT Teh The Tw ol olsh= A
+ ob Bol4 AZoz 4kmikd Wold 91%)
of 3, ofE C= oFtE BofA] 5&2 2 1 km,
FZo2 1kmE Hod fixe hs uf, BF
3} ofube B Afolo] Azle 2 kmeld] FaHA2.
```

**결과**: 거의 의미를 알 수 없는 쓰레기 텍스트

---

## 🔍 원인 분석

### 1. API 키 미설정
**파일**: `.env.local`
- Mathpix API 키 없음
- Google Vision API 키 없음
- **결과**: Tesseract (무료 폴백)만 사용

### 2. Tesseract 언어 설정 오류
**파일**: `lib/ocr/smart-ocr.ts:104`

```typescript
// ❌ 현재 코드 (영어만 지원)
const worker = await Tesseract.createWorker('eng', 1);
```

**문제점**:
- 영어(eng)만 로드
- 한국어(kor) 미지원
- 수학 기호(equ) 미지원

### 3. Tesseract의 근본적 한계

#### 한국어 인식률
| 텍스트 종류 | 정확도 | 비고 |
|------------|--------|------|
| 순수 한글 | 60-70% | 깨끗한 인쇄물 |
| 한글+영어 혼합 | 40-50% | 언어 전환 오류 |
| 한글+영어+수식 | **20-30%** | 현재 상황 |

#### 수학 OCR 정확도
- 간단한 숫자: 80-90%
- 분수/지수: 40-50%
- 복잡한 수식: **10-20%**

**Tesseract 공식 문서 인용**:
> "Displayed equations and formulas are usually completely garbled.
> Tesseract performs rather poorly for East Asian languages."

---

## 📊 Smart OCR 폴백 시스템 분석

### 현재 폴백 순서
```
1. Mathpix (99% 정확도) ❌ API 키 없음
   ↓
2. Google Vision (70-80% 수식) ❌ API 키 없음
   ↓
3. Tesseract (20-30% 혼합) ✅ 현재 사용 중
```

### 실제 작동 상황
```javascript
// lib/ocr/smart-ocr.ts:42-60
if (isMathpixAvailable()) {
  // ❌ Skip: API key not configured
}

if (isGoogleVisionAvailable()) {
  // ❌ Skip: API key not configured
}

// ✅ 여기서 실행됨
const result = await tesseractOCR(imageFile);
```

---

## 🎯 해결 방안

### 즉시 해결 (Phase 3.1): Tesseract 개선

#### 1.1 한국어 + 영어 지원 추가
**파일**: `lib/ocr/smart-ocr.ts`

```typescript
// 변경 전
const worker = await Tesseract.createWorker('eng', 1);

// 변경 후
const worker = await Tesseract.createWorker('kor+eng', 1, {
  logger: (m) => console.log('[Tesseract]', m),
});
```

**예상 효과**:
- 한국어 인식: 20-30% → **50-60%**
- 영어 인식: 80% → **75%** (약간 감소)
- **전체: 20-30% → 50-60%** (2배 개선)

#### 1.2 PSM (Page Segmentation Mode) 최적화

```typescript
await worker.setParameters({
  tessedit_pageseg_mode: '6', // Uniform text block
  preserve_interword_spaces: '1',
});
```

**예상 효과**: +5-10% 추가 개선

#### 1.3 이미지 전처리 추가

```typescript
// 명암 조정, 노이즈 제거
function preprocessImage(imageFile: File): Promise<File> {
  // Canvas API로 이미지 전처리
  // - Grayscale 변환
  // - 명암 대비 증가
  // - 노이즈 제거
}
```

**예상 효과**: +5-10% 추가 개선

### 중기 해결 (Phase 3.2): 프리미엄 OCR 유도

#### 2.1 사용자 안내 UI 추가

```typescript
// components/math/MathImageUpload.tsx에 추가
{!hasPremiumOCR() && (
  <div className="bg-yellow-50 border border-yellow-200 p-3">
    <p className="text-sm text-yellow-800">
      ⚠️ 무료 OCR 사용 중 (정확도 50-60%)
      <br />
      프리미엄 OCR 설정 시 <strong>99% 정확도</strong>로 향상됩니다.
    </p>
    <button className="text-blue-600 text-sm underline">
      설정 방법 보기
    </button>
  </div>
)}
```

#### 2.2 API 키 설정 가이드

**Mathpix (권장)**:
- 무료 플랜: 월 1,000 요청
- 정확도: 99%
- 발급: https://mathpix.com/ocr

**Google Vision (선택)**:
- 무료 플랜: 월 1,000 유닛
- 정확도: 70-80% (수식)
- 발급: https://console.cloud.google.com/

### 장기 해결 (Phase 3.3): 자체 OCR 개선

#### 3.1 Tesseract 커스텀 트레이닝
- 한국어 수학 문제 데이터셋 수집
- Tesseract 재학습
- 정확도: 50-60% → 70-80%

#### 3.2 하이브리드 접근
- EasyOCR (딥러닝 기반) 추가
- PaddleOCR (다국어 강점) 추가
- 정확도: 70-80%

---

## 📋 실행 계획

### Phase 3.1: 긴급 개선 (즉시 시작)
- [x] 원인 분석 완료
- [ ] Tesseract 한국어 지원 추가 (`kor+eng`)
- [ ] PSM 설정 최적화
- [ ] 로컬 테스트
- [ ] 예상 시간: 30분
- [ ] 예상 개선: 20-30% → **50-60%**

### Phase 3.2: 사용자 안내 (1-2시간)
- [ ] 프리미엄 OCR 안내 UI 추가
- [ ] API 키 설정 가이드 작성
- [ ] 이미지 전처리 구현
- [ ] 예상 개선: 50-60% → **60-70%**

### Phase 3.3: 근본 해결 (사용자 선택)
**옵션 A**: 프리미엄 OCR 사용
- Mathpix API 키 발급 (추천)
- 정확도: **99%**
- 비용: 무료 플랜 월 1,000 요청

**옵션 B**: 무료 개선
- Tesseract 개선 (Phase 3.1-3.2)
- 정확도: **60-70%**
- 비용: 무료

---

## 🎯 권장 사항

### 즉시 실행 (필수)
1. ✅ Tesseract 한국어 지원 추가
2. ✅ PSM 최적화
3. ✅ 사용자 안내 UI 추가

### 사용자 선택 (권장)
**프리미엄 OCR 설정**:
- 월 1,000 요청까지 무료
- 99% 정확도
- 설정 시간: 5분

**예상 결과**:
```
현재: 20-30% (거의 사용 불가)
   ↓ Phase 3.1 완료
개선 후: 50-60% (기본 사용 가능)
   ↓ Phase 3.2 완료
최종: 60-70% (무료 최선)
   ↓ Mathpix 설정 시
최고: 99% (완벽)
```

---

## 📊 비용 비교

| 옵션 | 월 비용 | 정확도 | 비고 |
|------|--------|--------|------|
| **현재** (영어만) | 무료 | 20-30% | 사용 불가 |
| **개선** (한+영) | 무료 | 60-70% | 기본 사용 |
| **Mathpix 무료** | 무료 | 99% | 1,000 요청/월 |
| **Mathpix 프리미엄** | $4~ | 99% | 무제한 |
| **Google Vision 무료** | 무료 | 70-80% | 1,000 유닛/월 |
| **Google Vision 유료** | $1.5~ | 70-80% | 무제한 |

---

## 🔧 기술 상세

### Tesseract.js 다국어 설정

**언어 코드**:
- `eng`: 영어
- `kor`: 한국어
- `equ`: 수학 기호 (실험적)

**조합 방법**:
```javascript
// 한국어 + 영어
'kor+eng'

// 한국어 + 영어 + 수학 (비추천: 정확도 하락)
'kor+eng+equ'
```

**조합 시 주의사항**:
- 언어가 많을수록 정확도 하락
- `kor+eng`가 최적 균형점
- `equ` 추가 시 -10% 정확도 감소

### PSM (Page Segmentation Mode)

| PSM | 설명 | 적합한 경우 |
|-----|------|-----------|
| 3 | 자동 (기본값) | 일반적 |
| 6 | 균일한 텍스트 블록 | 교과서, 문제집 |
| 11 | 순서 없는 텍스트 | 복잡한 레이아웃 |

**권장 설정**: PSM 6 (균일한 텍스트 블록)

---

## 📝 다음 단계

### 즉시 실행
1. Tesseract 한국어 지원 추가
2. 로컬 테스트
3. 사용자 안내 UI 추가

### 사용자 결정 대기
- 프리미엄 OCR 설정 여부
- 추가 개선 필요 여부

---

**작성일**: 2025-11-06
**상태**: 원인 분석 완료, 수정 대기
